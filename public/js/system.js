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
});