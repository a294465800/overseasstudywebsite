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
        $tel_call.show('100');
        $tel_logo.hide();
    });
    $tel_call.find('em').on('click',function () {
        $tel_logo.show();
        $tel_call.hide('100');
    });


    /*
    * 导航展示宽度修改
    * */
    var $nav_head = $('.nav_head'),
        width = $('.navigation').css('width'),
        margin = - parseInt(width) / 2;
    $nav_head.find('.nav_content').css('width',width);
    $nav_head.find('.nav_content').css('margin-left',margin);


});