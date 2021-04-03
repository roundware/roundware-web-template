import React, { useState, useRef } from "react";
import { withStyles, useTheme } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PhotoIcon from "@material-ui/icons/Photo";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import Badge from "@material-ui/core/Badge";

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

const AdditionalMediaMenu = ({
  onSetText,
  onSetImage,
  imageAssets,
  textAsset,
  disabled,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [addTextModalOpen, setAddTextModalOpen] = useState(false);
  const theme = useTheme();
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isTinyScreen = useMediaQuery(theme.breakpoints.down(350));
  const picker = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (
    process.env.ALLOW_PHOTOS === "true" &&
    process.env.ALLOW_TEXT === "true"
  ) {
    return (
      <div>
        <Button
          size={isTinyScreen ? "small" : "medium"}
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          startIcon={
            <>
              <Badge
                badgeContent={imageAssets.length}
                showZero={false}
                color="secondary"
              >
                <PhotoIcon />
              </Badge>
              <Badge
                badgeContent={textAsset ? textAsset.length : 0}
                showZero={false}
                color="secondary"
                variant="dot"
              >
                <TextFieldsIcon style={{marginLeft: 10}}/>
              </Badge>
            </>
          }
          disabled={disabled}
          onClick={handleClick}
        >
          {isExtraSmallScreen ? "Add" : "Add Media"}
        </Button>
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          autoFocus={false}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <PhotoPickerMenuItem
            ref={picker}
            onSetImage={onSetImage}
            openPicker={() => picker.current.click()}
            setAnchorEl={setAnchorEl}
          />
          <TextInputMenuItem
            {...{
              textAsset,
              addTextModalOpen,
              isExtraSmallScreen,
              onSetText,
              setAddTextModalOpen,
              setAnchorEl,
            }}
          />
        </StyledMenu>
      </div>
    );
  } else if (process.env.ALLOW_PHOTOS === "true") {
    return (
      <>
        <Button
          size={isTinyScreen ? "small" : "medium"}
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          startIcon={
            <Badge badgeContent={imageAssets.length} color="secondary">
              <PhotoIcon />
            </Badge>
          }
          disabled={disabled}
          onClick={() => picker.current.click()}
        >
          Add Photo
        </Button>
        <PhotoPickerInput onSetImage={onSetImage} ref={picker} setAnchorEl={setAnchorEl}/>
      </>
    );
  } else {
    return (
      <>
        <Button
          size={isTinyScreen ? "small" : "medium"}
          aria-controls="customized-menu"
          aria-haspopup="true"
          variant="contained"
          color="primary"
          startIcon={
            <Badge
              badgeContent={textAsset ? textAsset.length : 0}
              color="secondary"
              variant="dot"
            >
              <TextFieldsIcon />
            </Badge>
          }
          disabled={disabled}
          onClick={() => {
            setAddTextModalOpen(true);
          }}
        >
          Add Text
        </Button>
        <TextInputDialog
          {...{
            textAsset,
            addTextModalOpen,
            isExtraSmallScreen,
            onSetText,
            setAddTextModalOpen,
            setAnchorEl,
          }}
        />
      </>
    );
  }
};

const TextInputDialog = ({
  textAsset,
  addTextModalOpen,
  isExtraSmallScreen,
  onSetText,
  setAddTextModalOpen,
  setAnchorEl,
}) => (
  <Dialog open={addTextModalOpen}>
    <DialogContent style={isExtraSmallScreen ? { width: 254 } : { width: 500 }}>
      <TextField
        id="outlined-multiline-static"
        label="Tap/Click to Type!"
        multiline
        rows={6}
        defaultValue={textAsset || ""}
        variant="outlined"
        style={{ width: "100%" }}
        onBlur={(e) => onSetText(e.target.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          setAddTextModalOpen(false);
          setAnchorEl(null);
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setAddTextModalOpen(false);
          setAnchorEl(null);
        }}
      >
        Submit
      </Button>
    </DialogActions>
  </Dialog>
);
const TextInputMenuItem = ({
  textAsset,
  addTextModalOpen,
  setAddTextModalOpen,
  onSetText,
  setAnchorEl,
  isExtraSmallScreen,
}) => {
  return (
    <>
      <StyledMenuItem
        onClick={() => {
          setAddTextModalOpen(true);
        }}
      >
        <ListItemIcon>
          <TextFieldsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Add Text" />
      </StyledMenuItem>
      <TextInputDialog
        {...{
          textAsset,
          addTextModalOpen,
          isExtraSmallScreen,
          onSetText,
          setAddTextModalOpen,
          setAnchorEl,
        }}
      />
    </>
  );
};

const PhotoPickerMenuItem = React.forwardRef(
  ({ onSetImage, openPicker, setAnchorEl }, ref) => (
    <StyledMenuItem onClick={openPicker}>
      <PhotoPickerInput onSetImage={onSetImage} ref={ref} setAnchorEl={setAnchorEl}/>
      <ListItemIcon>
        <PhotoIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Add Photo" />
    </StyledMenuItem>
  )
);

const PhotoPickerInput = React.forwardRef(({ onSetImage, setAnchorEl }, ref) => (
  <input
    ref={ref}
    type="file"
    accept="image/jpeg, image/png, image/gif"
    style={{ display: "none" }}
    onChange={(e) => {
      onSetImage(e.target.files[0]);
      setAnchorEl(null);
    }}
  />
));
export default AdditionalMediaMenu;
