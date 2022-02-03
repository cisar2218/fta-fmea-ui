import * as React from "react";
import {useState} from "react";
import {
    Box,
    Checkbox,
    FormControl,
    FormGroup,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    TextField,
    Tooltip
} from "@material-ui/core";
import {Controller, useForm} from "react-hook-form";
import AddIcon from "@material-ui/icons/Add";
import useStyles from "@components/editor/system/menu/function/ComponentFunctionsList.styles";
import {useFunctions} from "@hooks/useFunctions";
import {yupResolver} from "@hookform/resolvers/yup";
import {schema} from "@components/dialog/function/FunctionPicker.schema";
import DeleteIcon from '@material-ui/icons/Delete';
import {Function} from "@models/functionModel";
import {useConfirmDialog} from "@hooks/useConfirmDialog";
import {Edit} from "@material-ui/icons";
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import {useHistory} from "react-router-dom";
import {extractFragment} from "@services/utils/uriIdentifierUtils";
import {useCurrentSystem} from "@hooks/useCurrentSystem";
import ComponentFunctionEdit from "@components/editor/system/menu/function/ComponentFunctionEdit";
import {formatFunctionOutput, formatOutput} from "@utils/formatOutputUtils";
import {BehaviorType, FailureMode} from "@models/failureModeModel";
import FailureModesList from "@components/editor/failureMode/FailureModesList";
import {useFailureMode} from "@hooks/useFailureModes";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Component } from "@models/componentModel";
import { SnackbarType, useSnackbar } from "@hooks/useSnackbar";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
}

const ComponentFunctionsList = ({ component }) => {
    const classes = useStyles();
    const history = useHistory();
    const [system] = useCurrentSystem()
    const [,,,,addFailureModeToFunction, removeFailureModeToFunction] = useFailureMode()
    const [requestConfirmation] = useConfirmDialog()
    const [functions, addFunction,, removeFunction,,, functionsAndComponents,generateFDTree,,, addExistingFunction] = useFunctions()
    const [requiredFunctions, setRequiredFunctions] = useState<Function[]>([]);
    const [selectedFunction, setSelectedFunction] = useState<Function>()
    const [selectedFailureModes, setSelectedFailureModes] = useState<FailureMode[]>([])
    const [behaviorType, setBehaviorType] = useState<BehaviorType>(BehaviorType.ATOMIC);
    const [childBehaviors, setChildBehaviors] = useState<Function[]>([]);
    const [showEdit, setShowEdit] = useState<boolean>(false)
	const [selectedFunctionsandComponents, setSelectedFunctionsAndComponents] = useState<[Function,Component][]>([])
	const [showSnackbar] = useSnackbar()


    const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

    const {register, handleSubmit, errors, control, reset} = useForm({
        resolver: yupResolver(schema)
    });
    const _handleCreateFunction = (values: any) => {
        if(values.name !== "") { // create new function
			let createFunction: Function = {name: values.name, requiredFunctions: requiredFunctions,failureModes: [], functionParts: childBehaviors, behaviorType: behaviorType}
			addFunction(createFunction).then(f => selectedFailureModes.forEach(fm => addFailureModeToFunction(fm.iri,f.iri)))
		}

		if(selectedFunctionsandComponents.length > 0){
			addExistingFunctions()
		}
		
		reset(values)
        setSelectedFailureModes([])
        setRequiredFunctions([])
        setBehaviorType(BehaviorType.ATOMIC)
        setChildBehaviors([])
		setSelectedFunctionsAndComponents([])
        setOpen(false);
    }
	
	const addExistingFunctions = async () => {
		selectedFunctionsandComponents.forEach( el => {
			addExistingFunction(el, component)
		})
	}

    const showEditForm = (funcToEdit: Function) => {
        setSelectedFunction(funcToEdit)
        setShowEdit(true)
    }

    const handleBehaviorTypeChange = (event) => {
        setBehaviorType(event.target.value);
        if (event.target.value === BehaviorType.ATOMIC) {
            setChildBehaviors([]);
        }
    };

    const updateFailureModes = (currentFailureModes: FailureMode[], selectedFailureModes: FailureMode[], functionIri: string) => {
        if (!Array.isArray(selectedFailureModes) && selectedFailureModes != null) {
            selectedFailureModes = [selectedFailureModes]
        }
        let currentFMIris = (currentFailureModes || []).map(fm => fm.iri)
        let selectedFMIris = (selectedFailureModes || []).map(fm => fm.iri)

        currentFMIris.forEach(fmIri => {
            if(!selectedFMIris.includes(fmIri)){
                removeFailureModeToFunction(fmIri,functionIri)
            }
        })
        selectedFMIris.forEach(fmIri =>{
            if(!currentFMIris.includes(fmIri)){
                addFailureModeToFunction(fmIri,functionIri)
            }
        })
    }

    const handleDeleteFunction = (funcToDelete: Function) => {
        requestConfirmation({
            title: 'Delete Function?',
            explanation: 'Are you sure you want to delete the function?',
            onConfirm: () => removeFunction(funcToDelete),
        })
    }

    const handleChange = (event) => {
        setRequiredFunctions(event.target.value)
    }
    
    const handleChildBehaviorChange = (event) => {
        setChildBehaviors(event.target.value)
    }

    const generateFunctionalDependencyTree = (functionUri: string, systemName:string, functionName: string) => {
        generateFDTree(functionUri, systemName, functionName).then(value => {
            history.replace( `/fta/${extractFragment(value.iri)}`);
        })
    }

    // @ts-ignore
    return (
		<React.Fragment>
			<List>
				{showEdit ? (
					<ComponentFunctionEdit
                        functionsAndComponents={functionsAndComponents}
						selectedFunction={selectedFunction}
                        setSelectedFunction={setSelectedFunction}
						selectedFailureModes={selectedFailureModes}
						setSelectedFailureModes={setSelectedFailureModes}
						setShowEdit={setShowEdit}
						updateFailureModes={updateFailureModes}
					/>
				) : (
					<Box>
						{functions.map((f) => (
							<ListItem key={f.iri}>
								<ListItemText primary={formatOutput(f.name, 35)} />
								<ListItemSecondaryAction>
									<IconButton className={classes.button} onClick={() => showEditForm(f)}>
										<Edit />
									</IconButton>
									<Tooltip
										disableFocusListener
										title={
											Array.isArray(f.requiredFunctions)
												? f.requiredFunctions.map((func) => func.name).join(", ") || "None"
												: f.requiredFunctions["name"]
										}
									>
										<IconButton
											className={classes.button}
											onClick={() => generateFunctionalDependencyTree(f.iri, system.name, f.name)}
										>
											<DeviceHubIcon />
										</IconButton>
									</Tooltip>
									<IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFunction(f)}>
										<DeleteIcon />
									</IconButton>
								</ListItemSecondaryAction>
							</ListItem>
						))}

						<Box className={classes.functions}>
							<FormGroup>
								<FormControl>
									<Dialog
										open={open}
										onClose={handleClose}
										aria-labelledby="alert-dialog-title"
										aria-describedby="alert-dialog-description"
									>
										<DialogTitle id="alert-dialog-title">Unselect function's parts</DialogTitle>
										<DialogContent>
											<DialogContentText id="alert-dialog-description">
												Do you want to unselect all functions selected as parts and create new Function?
											</DialogContentText>
										</DialogContent>
										<DialogActions>
											<Button onClick={handleClose}>No</Button>
											<Button onClick={handleSubmit(_handleCreateFunction)} autoFocus>
												Yes
											</Button>
										</DialogActions>
									</Dialog>
								</FormControl>
								<FormControl>
									<Controller
										as={TextField}
										autoFocus
										margin="dense"
										id="name"
										label="Function Name"
										type="text"
										fullWidth
										name="name"
										control={control}
										defaultValue=""
										inputRef={register}
										error={!!errors.name}
										helperText={errors.name?.message}
									/>
								</FormControl>

								<FormControl fullWidth>
									<InputLabel id="demo-simple-select-label">Function complexity:</InputLabel>
									<Select
										labelId="demo-simple-select-label"
										id="demo-simple-select"
										value={behaviorType}
										label="Behavior type"
										onChange={handleBehaviorTypeChange}
									>
										<MenuItem value={BehaviorType.ATOMIC}>Atomic</MenuItem>
										<MenuItem value={BehaviorType.AND}>And</MenuItem>
										<MenuItem value={BehaviorType.OR}>Or</MenuItem>
									</Select>
								</FormControl>

								{behaviorType != BehaviorType.ATOMIC && (
									<FormControl fullWidth>
										<InputLabel id="required-functions-multiselect-label">Parts:</InputLabel>
										<Select
											labelId="required-functions-multiselect-label"
											id="required-functions-multiselect"
											multiple
											value={childBehaviors}
											onChange={handleChildBehaviorChange}
											renderValue={(selected: any[]) => formatOutput(selected.map((value) => value.name).join(", "), 50)}
											MenuProps={MenuProps}
										>
											{functionsAndComponents.map((f) => (
												//@ts-ignore
												<MenuItem key={f[0].iri} value={f[0]}>
													<Checkbox checked={!!childBehaviors.includes(f[0])} />
													<Tooltip disableFocusListener title={f[0].name + (f[1] != null ? " (" + f[1].name + ")" : "")}>
														<ListItemText primary={formatFunctionOutput(f[0], f[1])} />
													</Tooltip>
												</MenuItem>
											))}
										</Select>
									</FormControl>
								)}

								<FormControl>
									<InputLabel id="required-functions-multiselect-label">Required functions:</InputLabel>
									<Select
										labelId="required-functions-multiselect-label"
										id="required-functions-multiselect"
										multiple
										value={requiredFunctions}
										onChange={handleChange}
										renderValue={(selected: any[]) => formatOutput(selected.map((value) => value.name).join(", "), 50)}
										MenuProps={MenuProps}
									>
										{functionsAndComponents.map((f) => (
											//@ts-ignore
											<MenuItem key={f[0].iri} value={f[0]}>
												<Checkbox checked={!!requiredFunctions.includes(f[0])} />
												<Tooltip disableFocusListener title={f[0].name + (f[1] != null ? " (" + f[1].name + ")" : "")}>
													<ListItemText primary={formatFunctionOutput(f[0], f[1])} />
												</Tooltip>
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<FormControl>
									<FailureModesList
										label={"Failure modes: "}
										functionIri={""}
										selectedFailureModes={selectedFailureModes}
										setSelectedFailureModes={setSelectedFailureModes}
										setCurrentFailureModes={() => {}}
									/>
										
									<Autocomplete
										id="add-existing-function"
										options={functionsAndComponents.filter(el => !el[1] || el[1].iri !== component.iri)}
										value={selectedFunctionsandComponents}
										onChange={(event: any, newValue: any) => {
											setSelectedFunctionsAndComponents(newValue);
											showSnackbar('Function\'s component will be changed', SnackbarType.WARNING);
										  }}
										getOptionLabel={(option) => option[0].name + " (" + (option[1] == null ? "None": option[1].name) + ")"}
										fullWidth
										multiple
										renderInput={(params) => <TextField {...params} label="Add existing function" />}
									/>									
									<IconButton className={classes.button} color="primary" component="span" onClick={(childBehaviors.length > 0 && behaviorType == BehaviorType.ATOMIC) ? handleClickOpen : handleSubmit(_handleCreateFunction)}>
										<AddIcon />
									</IconButton>
								</FormControl>
							</FormGroup>
						</Box>
					</Box>
				)}
			</List>
		</React.Fragment>
	);
}

export default ComponentFunctionsList;