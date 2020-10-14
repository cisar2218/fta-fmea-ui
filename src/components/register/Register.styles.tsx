import {makeStyles} from "@material-ui/core";
import {createStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            elevation: 3,
            padding: theme.spacing(2),
            margin: theme.spacing(2)
        },
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1)
        },
        alert: {
            marginTop: theme.spacing(2)
        }
    }),
);

export default useStyles;