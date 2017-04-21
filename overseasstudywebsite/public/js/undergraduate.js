/**
 * Created by SHINING on 2017/4/16.
 */
$(function () {
    //九宫格显示
    var $night_part_li = $('.night_part ul li'),
        time1;
    $night_part_li.mouseenter(function () {
        var $this = $(this);
        time1 = setTimeout(function () {
            $this.find('.night_hide').css('display','block');
            $this.find('h3').css('display','none');
        },150);
    });
    $night_part_li.mouseleave(function () {
        var $this = $(this).find('.night_hide');
        clearTimeout(time1);
        $this.fadeOut();
        $(this).find('h3').css('display','block');
    });

    //热门专业选择
    var $major_left = $('.major_left ul li'),
        $major_part = $('.major_part');
    $major_left.on('click',function () {
        var index = $major_left.index(this),
            temp = $major_part.eq(index);
        $major_left.css('width','170px');
        $major_left.css('background-color','#6699CC');
        $(this).animate({width:'220px'},100);
        $(this).css('background-color','#996666');
        $major_part.css('display','none');
        temp.fadeIn();
    });

    //院校推荐
    var $major_school = $('.major_school');

    $major_school.mouseenter(function () {
        $(this).stop();
        $(this).animate({height:'50%'},500);
    });
    $major_school.mouseleave(function () {
        $(this).stop();
        $(this).animate({height:'40px'},500);
    });
});