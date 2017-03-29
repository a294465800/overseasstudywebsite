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
        $tel_call.show('1000');
        $tel_logo.hide();
    });
    $tel_call.find('em').on('click',function () {
        $tel_logo.show();
        $tel_call.hide('1000');
    });
});