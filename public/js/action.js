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
    * 导航展示
    * */
    var $nav_head = $('.nav_head');
    $nav_head.on('mouseover',function () {
        var width = $('.navigation').css('width');
        width = parseInt(width) - 230;
        $(this).find('.nav_content').css('width',width + 'px');
        $(this).find('.nav_content').show();
    });
    $nav_head.on('mouseout',function () {
        $(this).find('.nav_content').hide();
    })
});