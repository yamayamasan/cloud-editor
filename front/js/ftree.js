
var __ul = '<ul></ul>';
var __li = '<li><span class="{span1class}"><a class="ftree-file-name">{file}</a></span></li>';

function fTree(element, children) {
  console.log(children);
  tree1(children.children);
}

var tree1 = function (children){
  children.forEach(function(item){
    var type = (item.isFolder)? 'folder' : 'file';
    var li = __li.replace(/\{file\}/, item.title)
                 .replace(/\{span1class\}/, (type === 'folder')? 'ftree-folder' : 'ftree-file');
    console.log(li);
  });
};


