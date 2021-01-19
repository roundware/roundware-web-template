import React from "react";

class AssetPlayer extends React.Component {
  render() {
    const { asset } = this.props;
    if (!asset) {
      return null;
    }

    let ext = (/(?:\.([^.]+))?$/).exec(asset.file)[1]
    let filename = asset.file
    const supported = ['mp3', 'wav', 'mp4'];
    if (supported.indexOf(ext) === -1) {
      ext = "mp3"
      filename = `${filename}.${ext}`
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
