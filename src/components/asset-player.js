import React from "react";

class AssetPlayer extends React.Component {
  render() {
    const { asset } = this.props;
    if (!asset) {
      return null;
    }

    let ext = (/(?:\.([^.]+))?$/).exec(asset.file)[1]
    let filename = asset.file
    const supported = ['mp3', 'wav'];
    if (supported.indexOf(ext) === -1) {
      ext = "mp3"
      let pos = filename.lastIndexOf(".");
      filename = filename.substr(0, pos < 0 ? filename.length : pos) + "." + ext;
    }

    const audioType = `audio/${ext}`

    return (
      <audio
        controls
        style={this.props.style}
        preload="none"
        controlsList="nodownload"
        className={this.props.className}
      >
        <source src={filename} type={audioType} />
        Your browser does not support audio!
      </audio>
    );
  }
}

export default AssetPlayer;
