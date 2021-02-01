window.onload = function() {	// html 상단에서 로드하지만 html이 모두 로드되고 스크립트가 실행되도록.
	
	// Edit을 불러왔을 때 #body에 값이 있으면 #editor에 그 값을 html로 변환해 채움.
	if (document.getElementById('body').value) {
		document.getElementById('editor').innerHTML = document.getElementById('body').value;
	}
	
	// #Post를 제출하면 #editor의 html을 #body에 text로 채움.
	document.getElementById('Post')
		.addEventListener('submit', () => {
			var editor = document.getElementById('editor');
			var htmlView = document.getElementById('htmlView');
			if (htmlView.checked)
				editor.innerHTML = editor.innerText;
			document.getElementById('body').value = editor.innerHTML;
		});
	
	
	// 효과들.
	document.getElementById('undo')
		.addEventListener('click', () => document.execCommand('undo'));
	
	document.getElementById('redo')
		.addEventListener('click', () => document.execCommand('redo'));
	
	document.getElementById('removeFormat')
		.addEventListener('click', () => document.execCommand('removeFormat'));
	
	document.getElementById('bold')
		.addEventListener('click', () => document.execCommand('bold'));
	
	document.getElementById('italic')
		.addEventListener('click', () => document.execCommand('italic'));
	
	document.getElementById('underline')
		.addEventListener('click', () => document.execCommand('underline'));
	
	document.getElementById('strikeThrough')
		.addEventListener('click', () => document.execCommand('strikeThrough'));
	
	document.getElementById('justifyLeft')
		.addEventListener('click', () => document.execCommand('justifyLeft'));
	
	document.getElementById('justifyCenter')
		.addEventListener('click', () => document.execCommand('justifyCenter'));
	
	document.getElementById('justifyRight')
		.addEventListener('click', () => document.execCommand('justifyRight'));
	
	document.getElementById('indent')
		.addEventListener('click', () => document.execCommand('indent'));
	
	document.getElementById('outdent')
		.addEventListener('click', () => document.execCommand('outdent'));
	
	document.getElementById('heading')
		.addEventListener('change', () => {
			var selectOp = document.getElementById('heading');
			document.execCommand('formatBlock', false, selectOp[selectOp.selectedIndex].value);
			selectOp.selectedIndex = 0;
		})
	
	document.getElementById('olist')
		.addEventListener('click', () => document.execCommand('insertOrderedList'));
	
	document.getElementById('ulist')
		.addEventListener('click', () => document.execCommand('insertUnorderedList'));
	
	document.getElementById('horizon')
		.addEventListener('click', () => document.execCommand('insertHorizontalRule'));
	
	document.getElementById('hyperlink')
		.addEventListener('click', () => {
		
			var sLink = prompt('Write the URL here','http:\/\/');
			var sText = document.getSelection();
			if(sLink&&sLink!=''&&sLink!='http://')
				document.execCommand('insertHTML', false, '<a href="'+sLink+'" target="_blank">'+sText+'</a>');
		
		});
	
	document.getElementById('insertImage')
		.addEventListener('change', (evt) => {
		
			for (var img of evt.target.files) {
				var reader = new FileReader();
				reader.readAsDataURL(img);
				reader.onload = () => document.execCommand('insertImage', false, reader.result);
			}
		
		});
	
	document.getElementById('htmlView')
		.addEventListener('change', () => {
			var editor = document.getElementById('editor');
			var htmlView = document.getElementById('htmlView');
			if (htmlView.checked) {
				editor.innerText = editor.innerHTML;
				editor.contentEditable = false;
			}
			else {
				editor.innerHTML = editor.innerText;
				editor.contentEditable = true;
			}
		});
	
};