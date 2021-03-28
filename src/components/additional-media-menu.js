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
    disabled
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
              <Badge badgeContent={imageAssets.length} color="secondary">
                <PhotoIcon />
              </Badge>
              <Badge
                badgeContent={textAsset ? textAsset.length > 0 : 0}
                color="secondary"
                variant="dot"
              >
                <TextFieldsIcon />
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
          <PhotoPickerMenuItem picker={picker} onSetImage={onSetImage} />
          <TextInputMenuItem />
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
        <PhotoPickerInput onSetImage={onSetImage} picker={picker} />
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
              badgeContent={textAsset ? textAsset.length > 0 : 0}
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
  addTextModalOpen,
  isExtraSmallScreen,
  onSetText,
  setAddTextModalOpen,
  setAnchorEl,
}) => (
  <Dialog open={addTextModalOpen}>
    <DialogContent style={isExtraSmallScreen ? { width: 300 } : { width: 500 }}>
      <TextField
        id="outlined-multiline-static"
        label="Tap/Click to Type!"
        multiline
        rows={6}
        defaultValue=""
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

const TextInputMenuItem = ({ setAddTextModalOpen }) => {
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
      <TextInputDialog />
    </>
  );
};

const PhotoPickerMenuItem = ({ onSetImage, picker }) => (
  <StyledMenuItem onClick={() => picker.current.click()}>
    <PhotoPickerInput onSetImage={onSetImage} picker={picker} />
    <ListItemIcon>
      <PhotoIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText primary="Add Photo" />
  </StyledMenuItem>
);

const PhotoPickerInput = ({ onSetImage, picker }) => (
  <input
    ref={picker}
    type="file"
    accept="image/jpeg, image/png, image/gif"
    style={{ display: "none" }}
    onChange={(e) => {
      onSetImage(e.target.files[0]);
    }}
  />
);
export default AdditionalMediaMenu;
