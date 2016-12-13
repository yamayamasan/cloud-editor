'use strict';

APP.service('AceSrv', [function() {

  var editor = null;
  var modeList = null;
  var themeList = null;

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
    getModePath: function(e) {
      return modeList.getModeForPath(e);
    },
    modeList: function() {
      if (modeList !== null) return modeList;
      modeList = ace.require('ace/ext/modelist');
      return modeList;
    },
    themeList: function() {
      if (themeList !== null) return themeList;
      themeList = ace.require('ace/ext/themelist');
      return themeList;
    },
    immed: function() {
      return editor;
    }
  };
}]);
