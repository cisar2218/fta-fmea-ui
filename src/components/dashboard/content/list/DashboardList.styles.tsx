import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => {
        return createStyles({
            gridList: {
                padding: theme.spacing(1, 0, ),
                height: 'auto',
            },
            gridListTile: {
                height: '100% !important',
            },
        })
    }
);

export default useStyles;