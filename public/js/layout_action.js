/**
 * Created by SHINING on 2017/3/28.
 */
$(function () {

    /*
    * 侧栏免费通话
    * */
    var $tel_logo = $('.tel_logo'),
        $tel_call = $('.tel_call');

    $tel_logo.on('click',function () {
        $tel_call.show();
        $tel_logo.hide();
    });
    $tel_call.find('em').on('click',function () {
        $tel_logo.show();
        $tel_call.hide();
    });


    /*
    * 导航展示宽度修改
    * */
    var $nav_head = $('.nav_head'),
        width = $('.navigation').css('width');
    $nav_head.find('.nav_content').css('width',width);

    /*
    * 文章统计
    * */
    var $article_content_a = $('#article_content a');

    $article_content_a.on('click',function () {
        var $this = $(this);
        $.ajax({
            type: 'post',
            url: 'api/Abroad_article',
            data: {
	            article: $this.data('id')
            },
            dataType: 'json',
	        success: function () {
	        }
        })
    });

});