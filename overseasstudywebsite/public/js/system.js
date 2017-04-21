/**
 * Created by SHINING on 2017/3/30.
 */
$(function () {
    var $navigation = $('#navigation'),
        $nav_title = $('#nav_title'),
        $navigation_edit = $('#navigation_edit'),
        $nav_title_edit = $('#nav_title_edit');

    //导航标题二级联动菜单
    $navigation.on('change',function () {
        $.ajax({
            type: 'post',
            url: '/api/navigation/title/content/add',
            data:{
                navigation: $navigation.val()
            },
            dataType:'json',
            success: function (data) {
                $nav_title.html('<option value="">请选择导航标题</option>');
                for(var nav_title in data.nav_titles){
                    $nav_title.append('<option value="'+ data.nav_titles[nav_title]._id +'">'+ data.nav_titles[nav_title].Nav_title +'</option>');
                }
            }
        });
    });


    //导航标题修改二级联动菜单
    $navigation_edit.on('change',function () {
        $.ajax({
            type: 'post',
            url: '/api/navigation/title/content/edit',
            data:{
                navigation: $navigation_edit.val()
            },
            dataType: 'json',
            success: function (data) {
                if(data.nav_titles == ''){
                    $nav_title_edit.html('<option value="">该导航下没有标题</option>');
                    return ;
                }
                $nav_title_edit.html('');
                for(var nav_title in data.nav_titles){
                    if(data.nav_content.nav_title._id.toString() == data.nav_titles[nav_title]._id.toString()){
                        $nav_title_edit.append('<option value="'+ data.nav_titles[nav_title]._id +'" selected>'+ data.nav_titles[nav_title].Nav_title +'</option>');

                    }else{
                        $nav_title_edit.append('<option value="'+ data.nav_titles[nav_title]._id +'">'+ data.nav_titles[nav_title].Nav_title +'</option>');
                    }
                }
            }
        });
    });

    //留学文章添加二级联动菜单
    var $abroad = $('#abroad'),
        $abroad_nav = $('#abroad_nav');
    $abroad.on('change',function () {
        $.ajax({
            type: 'post',
            url: '/api/study_abroad/nav/content/add',
            data:{
                abroad: $abroad.val()
            },
            dataType:'json',
            success: function (data) {
                if(data.abroad_navs == ''){
                    $abroad_nav.html('<option value="">该留学项目下没有导航</option>');
                    return ;
                }
                $abroad_nav.html('<option value="">请选择留学导航</option>');
                for(var abroad_nav in data.abroad_navs){
                    $abroad_nav.append('<option value="'+ data.abroad_navs[abroad_nav]._id +'">'+ data.abroad_navs[abroad_nav].Abroad_nav_name +'</option>');
                }
            }
        });
    });


    //培训文章添加二级联动菜单
    var $test = $('#test'),
        $training = $('#training');

    $test.on('change',function () {
        $.ajax({
            type: 'post',
            url: '/api/training/content/add',
            data:{
                test: $test.val()
            },
            dataType:'json',
            success: function (data) {
                if(data.trainings == ''){
                    $training.html('<option value="">该考试项目下没有培训分类</option>');
                    return ;
                }
                $training.html('<option value="">请选择培训分类</option>');
                for(var trainings in data.trainings){
                    $training.append('<option value="'+ data.trainings[trainings]._id +'">'+ data.trainings[trainings].Training_name +'</option>');
                }
            }
        });
    });
});