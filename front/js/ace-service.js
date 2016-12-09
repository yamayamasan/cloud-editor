'use strict';

APP.service('AceSrv', [function() {

  var editor = null;
  var modeList = null;

  // https://github.com/ajaxorg/ace/blob/master/demo/modelist.html
  return {
    init: function(e) {
      editor = ace.edit(e);
      editor.setFontSize(14);
      editor.getSession().setUseWrapMode(true);
      editor.getSession().setTabSize(4);
      editor.$blockScrolling = Infinity;
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });
    },
    modeList: function() {
      if (modeList !== null) return modeList;
      // modeList = ace.require('
    },
    immed: function() {
      return editor;
    }
  };
}]);
