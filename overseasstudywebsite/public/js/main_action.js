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
        if(temp1.css('display') === 'block'){
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


    /*
    * 各留学的mouseover事件
    * */
    var $study_abroad_nav_li = $('.study_abroad_nav ul li');

    $study_abroad_nav_li.on('mouseover',function () {
        var $parent = $(this).closest('.study_abroad_nav'),
            $parent2 = $(this).closest('.study_abroad_content').find('.study_abroad_num'),
            backColor = $(this).css('background-color'),
            index = $parent.find('li').index(this),
            temp = $parent2.eq(index);
        if(backColor === 'rgb(255, 255, 255)'){
        }else{
            $parent.find('li').css('background-color',backColor);
            $parent.find('a').css('color','#fff');
            $(this).css('background-color','#fff');
            $(this).find('a').css('color',backColor);
            $parent2.animate({opacity: 0},50);
            $parent2.css('display','none');
            temp.css('display','block');
            temp.animate({opacity: 1},50);
        }
    });


    /*
    * 高分案例mouseover事件
    * */
    var $case_title_a = $('.case_title a');

    $case_title_a.on('mouseover',function () {
        var $parent = $(this).closest('.case_title').find('a'),
            index = $parent.index(this),
            $parent2 = $(this).closest('.study_abroad_case').find('.case_content'),
            temp = $parent2.eq(index);
        if(temp.css('display') === 'block'){
        }else{
            $parent.css('background-color','#fff');
            $(this).css('background-color','#337ab7');
            $parent2.animate({opacity: 0},100);
            $parent2.css('display','none');
            temp.css('display','block');
            temp.animate({opacity: 1},100);
        }
    });

    /*
    * 案例下的mouseover事件
    * */
    var $case_content_p = $('.case_content p');

    $case_content_p.on('mouseover',function () {
        var $parent = $(this).closest('.case_content'),
            index = $parent.find('p').index(this),
            $parent2 = $parent.find('ul'),
            temp = $parent2.eq(index);
        if(temp.css('display') === 'block'){
        }else{
            $parent2.animate({opacity: 0},50);
            $parent2.css('display','none');
            temp.css('display','block');
            temp.animate({opacity: 1},300);
        }
    });


    /*
    * 能力培训mouseover事件
    * */
    var $training_list_li = $('.training_list li'),
        $training_list_a = $('.training_list li a'),
        $training_block = $('.training_block');

    $training_list_li.mouseenter(function () {
        var index = $training_list_li.index(this),
            temp = $training_block.eq(index);
        $training_block.css('display','none');
        $training_list_a.css('color','#fff');
        $(this).find('a').css('color','#333');
        temp.css('display','block');
    });

});