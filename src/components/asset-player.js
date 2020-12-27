import React from "react";

class AssetPlayer extends React.Component {
  render() {
    const { asset } = this.props;
    if (!asset) {
      return null;
    }

    let [...fileparts] = asset.file.split('.')
    let ext = fileparts.pop();
    let filename = fileparts.join(".")

    if (ext !== 'mp3' && ext !== 'wav') {
      ext += 'mp3'
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
        <source src={`${filename}.${ext}`} type={audioType} />
        Your browser does not support audio!
      </audio>
    );
  }
}

export default AssetPlayer;
