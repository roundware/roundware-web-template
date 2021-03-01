import React, { useState } from 'react';
import { useRoundware } from "../hooks";
import 'date-fns';
import clsx from 'clsx';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from "@material-ui/core/Typography";
import FilterListIcon from '@material-ui/icons/FilterList';
import LabelIcon from '@material-ui/icons/Label';
import { TagFilterMenu } from './asset-filter-panel';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },

});

const ListenFilterDrawer = () => {
  const classes = useStyles();
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const [selectedStartDate, setSelectedStartDate] = useState(new Date('2021-01-01T21:11:54'));
  const [selectedEndDate, setSelectedEndDate] = useState(new Date('2021-01-01T21:11:54'));
  const { roundware, userFilter, setUserFilter } = useRoundware();
  if (!(roundware.uiConfig && roundware.uiConfig.listen)) {
    return null;
  }

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
  };
  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem>
          <Typography variant={"subtitle1"}>Filter Recordings</Typography>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="start-date-picker-inline"
              label="Start Date"
              value={selectedStartDate}
              onChange={handleStartDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change start date',
              }}
            />
          </MuiPickersUtilsProvider>
        </ListItem>
        <ListItem>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="MM/dd/yyyy"
              margin="normal"
              id="end-date-picker-inline"
              label="End Date"
              value={selectedEndDate}
              onChange={handleEndDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change end date',
              }}
            />
          </MuiPickersUtilsProvider>
        </ListItem>
        <Divider />
        <ListItem key="tags-header">
          <ListItemIcon><LabelIcon /></ListItemIcon>
          <ListItemText primary="Filter by Tags" />
        </ListItem>
          {roundware.uiConfig.listen.map((tg) => (
            <ListItem key={"list-item" + tg.group_short_name}>
              <TagFilterMenu key={tg.group_short_name} tag_group={tg} />
            </ListItem>
          ))}
      </List>
    </div>
  );

  return (
    <div>
      <React.Fragment key={'filter'}>
        <Button onClick={toggleDrawer('filter', true)}>
          <FilterListIcon fontSize="large" />
        </Button>
        <Drawer
          anchor={'right'}
          open={state['filter']}
          onClose={toggleDrawer('filter', false)}
        >
          {list('right')}
        </Drawer>
      </React.Fragment>
    </div>
  );
}

export default ListenFilterDrawer;
