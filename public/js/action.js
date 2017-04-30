/**
 * Created by Administrator on 2017/4/28.
 */
$(function () {
	var btnSub = $('#btnSub'),
		errorTip = $('#errorTip'),
		file_info = document.getElementById('file-info'),
		file_list = document.getElementById('file_list'),
		file_num = $('#file_num');
	var files = [];

	btnSub.on('click',function(){
		var length = file_info.files.length;
		var fd = new FormData();
		var re = /\/admin.*/;
		//获取当前URL，用于判定post请求的位置
		var url = document.URL;
		url = url.match(re);
		errorTip.css('display','none');

		console.log(file_info.files  === files);
		if(!length)
		{
			errorTip.css('display','block');
			return false;
		}

		//利用FormData对象，存放files
		for (var i = 0, j = files.length; i<j;i++){
			//第一个参数是提交后的数据名，第二个参数是要接入的数据
			fd.append('files', files[i]);
		}

		var xhrOnProgress = function(fun) {
			xhrOnProgress.onprogress = fun; //绑定监听
			//使用闭包实现监听绑
			return function() {
				//通过$.ajaxSettings.xhr();获得XMLHttpRequest对象
				var xhr = $.ajaxSettings.xhr();
				//判断监听函数是否为函数
				if (typeof xhrOnProgress.onprogress !== 'function')
					return xhr;
				//如果有监听函数并且xhr对象支持绑定时就把监听函数绑定上去
				if (xhrOnProgress.onprogress && xhr.upload) {
					xhr.upload.onprogress = xhrOnProgress.onprogress;
				}
				return xhr;
			}
		};
		var progress = $('.file_load');
		var percentage = $('.percent');
		var cancel = $('.file_cancel');
		$.ajax({
			type: 'post',
			url: url,
			data: fd,
			processData: false,
			contentType: false,
			xhr: xhrOnProgress(function (e) {
				var percent = (e.loaded / e.total * 100 | 0);//计算百分比
				progress.val(percent);
				progress.html(percent);
				percentage.html(percent + '%');
				if(progress.val() === 100){
					cancel.html('成功');
					//成功后解绑取消函数，同时清空表单的文件
					cancel.off();
					files = [];
					file_info.value = '';
				}
			}),
			success: function (data) {
				file_num.html(data.message);
			}
		});
		//阻止默认表单提交
		return false;
	});
	$('#file-info').change(function () {
		//隐藏错误提示
		errorTip.css('display','none');
		file_list.innerHTML = '';
		var html = '';
		//默认的文件files不能操作（没有权限），只能赋值给新数组，对新数组进行操作
		Array.prototype.push.apply(files, file_info.files);

		//数组筛选，除掉重复的文件
		var tmp;
		tmp = files;
		for(var i = 0, a = files.length; i < a; i++){
			for(var j = i+1; j < files.length; j++){
				if(tmp[i].name === files[j].name){
					tmp[i] = '';
				}
			}
		}
		files = [];
		for(var i = 0, j = 0; i < tmp.length; i++){
			if(tmp[i]){
				files[j] = tmp[i];
				j++;
			}
		}

		//打印文件列表
		for(var file in files){
			html += '<li><p>' + files[file].name + '</p><span class="file_cancel">取消</span><br><progress class="file_load" value="0" max="100">0</progress><span class="percent">0</span></li>';
		}
		file_list.innerHTML = html;
		$('#file-info').css('color',"#fff");
		file_num.html('你已经选择了' + files.length + '个文件');

		//添加取消按钮事件
		$('.file_cancel').on('click',function () {
			var $this_li = $(this).closest('li');
			var name = $this_li.find('p').text();
			$this_li.hide();
			files = files.filter(function (file) {
				return file.name !== name;
			});
			file_num.html('你已经选择了' + files.length + '个文件');
		});
	});
});