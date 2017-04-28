/**
 * Created by Administrator on 2017/4/28.
 */
$(function () {
	var btnSub = $('#btnSub'),
		errorTip = $('#errorTip'),
		typeTip = $('#typeTip');

	btnSub.on('click',function(){
		var file_info = document.getElementById('file-info'),
			length = file_info.files.length;

		errorTip.css('display','none');
		typeTip.css('display','none');

		if(!length)
		{
			errorTip.css('display','block');
			return false;
		}
		//获取文件后缀名
		for(var i = 0;i < length; i++){
			var extName = file_info.files[i].name.substring(file_info.files[i].name.lastIndexOf('.'),file_info.files[i].name.length).toLowerCase();
			if(extName !== '.png' && extName !== '.jpg'){
				typeTip.css('display','block');
				return false;
			}
		}
		return true;
	});
	$('#file-info').change(function () {
		errorTip.css('display','none');
		typeTip.css('display','none');
	});
});