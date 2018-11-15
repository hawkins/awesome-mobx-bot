module.exports = {
  getSourceIndex: (source, type) => {
    // TODO: Fix this for some sections (i.e., Videos)
    const format = `^#+ ${type}(\\n+^[^#\\n].*$)*`;
    const regex = new RegExp(format, "gmi");

    let m = regex.exec(source);

    if (m) {
      return {
        index: m.index,
        length: m[0].length
      };
    } else {
      return {
        index: -1,
        length: -1
      };
    }
  }
};
