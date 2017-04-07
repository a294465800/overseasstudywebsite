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
    * 导航展示
    * */
    var $nav_head = $('.nav_head'),
        width = $('.navigation').css('width');
    width = parseInt(width) - 230;
    $nav_head.find('.nav_content').css('width',width + 'px');

    /*
    * 手动图片轮转
    * */
    var $bg_btn = $('.bg_btn li'),
        $bg_part = $('.bg_part'),
        $big = $('.big');
    $bg_btn.on('mouseover',function () {
        var index = $bg_btn.index(this),
            temp1 = $bg_part.children().eq(index).find('a'),
            temp2 = $big.children().eq(index);
        $bg_btn.css('background','#fff');
        $(this).css('background','#337ab7');
        if(temp1.css('display') == 'block'){
            return ;
        }

        //图片全部隐藏
        $big.find('div').animate({opacity: 0.9},100);
        $bg_part.find('a').animate({opacity: 0.9},100);
        $big.find('div').css('display','none');
        $bg_part.find('a').css('display','none');

        //对应图片显示
        temp2.animate({opacity:1});
        temp1.animate({opacity:1});
        temp1.css('display','block');
        temp2.css('display','block');
        picNum = index;
    });


    /*
    * 自动图片轮转
    * */
    var picNum = 0,
        $bgBtn = $('.bg_btn');

    picNum = picGo(picNum);
    var time1 = setInterval(function () {
            picNum = picGo(picNum);
        },4000);

    function picGo(picNum) {
        var i = picNum;

        if(i > 3){
            i = 0;
            $bgBtn.children().eq(0).triggerHandler('mouseover');
            i++;
        }else{
            $bgBtn.children().eq(picNum).triggerHandler('mouseover');
            i++;
        }
        return i;
    }

    /*
    * 留学攻略、咨询
    * */
    var $school_news_title = $('.school_news_title'),
        $school_news_move = $('.school_news_move');

    $school_news_title.find('a').on('mouseover',function () {
        var index = $school_news_title.find('a').index(this),
            temp = $school_news_move.children().eq(index);

        $school_news_title.find('a').css('color','#818181');
        $(this).css('color','#337ab7');
        $school_news_move.find('div').css('display','none');
        temp.css('display','block');
    });

});