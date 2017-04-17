/**
 * Created by SHINING on 2017/4/17.
 */
$(function () {
    //点赞系统
    var $love = $('.love');
    $love.on('click',function () {
        var $this = $(this);
        $.ajax({
            type: 'post',
            url: 'api/school',
            data: {
                school: $this.data('id')
            },
            dataType: 'json',
            success: function (data) {
                if(data.ok == 1){
                    $this.text(data.love);
                }
            }
        });
    });
});