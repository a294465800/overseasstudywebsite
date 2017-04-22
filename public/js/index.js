/**
 * Created by SHINING on 2017/3/20.
 */
/*
* 登录模块的js代码
* */

$(function () {
    var $login = $('#login'),
        $loginBox = $('#loginBox'),
        $register = $('#register'),
        $username = $('#username'),
        $logout = $('#logout'),
        $registerBox = $('#registerBox'),
        $inputEmail = $('#inputEmail'),
        $inputEmail2 = $('#inputEmail2'),
        $phone = $('#registerBox .phone'),
        $password1 = $('#password'),
        $password2 = $('#password2'),
        $password = $('#registerBox .password'),
        $repassword2 = $('#repassword2'),
        $repassword = $('#registerBox .repassword'),
        $tips = $('#registerBox .tips a'),
        $tips2 = $('#loginBox .tips2'),
        news = '',  //用户名  0代表success   1代表出错    2代表默认
        news2 = '',  //密码
        news3 = '';   //二次密码

    //打开登录面板
    $login.on('click',function () {
        //alert('a');
        $loginBox.show();
        $registerBox.hide();
    });
    //打开注册面板
    $register.on('click',function () {
        $registerBox.show();
        $loginBox.hide();
    });
    //关闭面板
    $loginBox.find('span').on('click',function () {
        $loginBox.hide();
        $inputEmail.val('');
        $password1.val('');
        $tips2.html('');
    });
    $registerBox.find('span').on('click',function () {
        $registerBox.hide();
        $inputEmail2.val('');
        $password2.val('');
        $repassword2.val('');
        $tips.html('');
        $phone.html('请填写手机号码或者邮箱');
        $phone.css('color','#999');
        $password.html('密码6~16个字符，区分大小写');
        $password.css('color','#999');
        $repassword.html('请再次填写密码');
        $repassword.css('color','#999');
    });

    //新用户注册和已有帐号
    $loginBox.find('.zhuce li a').on('click',function () {
        $loginBox.hide();
        $registerBox.show();
    });
    $registerBox.find('.denglu li a').on('click',function () {
        $registerBox.hide();
        $loginBox.show();
    });

    //用户名检测函数
    function nameCheck(value) {
        var phone = /^1\d{10}$/,
            eMail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
            $value = value;

        $.ajax({
            type: 'post',
            url: 'api/user/register/namecheck',
            data: {
                username: $value,
                news: function () {
                    if($value == ''){
                        news = '2';
                        return '2';
                    }else{
                        if(phone.test($value) || eMail.test($value)){
                            news = '0';
                            return '0';
                        }else{
                            news = '1';
                            return '1';
                        }
                    }
                }
            },
            dataType: 'json',
            success: function (data) {
                if(data.code === 1 || data.code === 2){
                    $phone.html(data.message);
                    $phone.css('color','#a94442');
                }else if(data.code === 3){
                    $phone.html(data.message);
                    $phone.css('color','#3c763d');
                }else {
                    $phone.html(data.message);
                    $phone.css('color','#999');
                }
            }
        });
    }

    //密码检测函数
    function passwordCheck(value) {
        var $value = value;
        $.ajax({
            type: 'post',
            url: 'api/user/register/passwordcheck',
            data:{
                password: $value,
                news2: function () {
                    if(!$value){
                        news2 = '2';
                        return '2';
                    }else{
                        if($value.length >= 6 && $value.length<=16){
                            news2 = '0';
                            return '0';
                        }else{
                            news2 = '1';
                            return '1';
                        }
                    }
                }
            },
            dataType: 'json',
            success: function (data) {
                if(data.code === 5){
                    $password.html(data.message);
                    $password.css('color','#a94442');
                }else if(data.code === 6){
                    $password.html(data.message);
                    $password.css('color','#3c763d');
                }else {
                    $password.html(data.message);
                    $password.css('color','#999');
                }
            }
        });
    }

    //密码二次检测函数
    function repasswordCheck(value) {
        var $value = value;
        $.ajax({
            type: 'post',
            url: 'api/user/register/repasswordcheck',
            data: {
                repassword: $value,
                news3: function () {
                    if(!$value){
                        news3 = '2';
                        return '2';
                    }else{
                        if( $password2.val() === $value){
                            news3 = '0';
                            return '0';
                        }else{
                            news3 = '1';
                            return '1';
                        }
                    }
                }
            },
            dataType: 'json',
            success: function (data) {
                if(data.code === 8){
                    $repassword.html(data.message);
                    $repassword.css('color','#a94442');
                }else if(data.code === 9){
                    $repassword.html(data.message);
                    $repassword.css('color','#3c763d');
                }else {
                    $repassword.html(data.message);
                    $repassword.css('color','#999');
                }
            }
        });
    }

    //实时检测用户名的正确性
    $inputEmail2.on('input propertychange',function () {
        nameCheck($(this).val());
    });

    //实时检测密码是否正确
    $password2.on('input propertychange',function (){
        passwordCheck($(this).val());
    });

    //实时检测二次密码是否一致
    $repassword2.on('input propertychange',function (){
        repasswordCheck($(this).val());
    });

    //注册
    $registerBox.find('button').on('click',function () {

        if(!$inputEmail2.val()){
            $phone.html('帐号不能为空！');
            $phone.css('color','#a94442');
        }
        if(!$password2.val()){
            $password.html('密码不能为空！');
            $password.css('color','#a94442');
        }
        if(!$repassword2.val()){
            $repassword.html('二次密码不能为空！');
            $repassword.css('color','#a94442');
        }
        /*
        * 当没有错误的时候才发送ajax请求
        * */
        if(news === '0' && news2 === '0' && news3 === '0'){
            $.ajax({
                type: 'post',
                url: 'api/user/register',
                data: {
                    username: $registerBox.find('[name = "username"]').val(),
                    password: $registerBox.find('[name = "password"]').val(),
                    repassword: $registerBox.find('[name = "repassword"]').val()
                },
                dataType: 'json',
                success: function (data) {
                    var time = 3,
                        stop;
                    $tips.html(data.message + time + '秒后跳转登录页面');
                    stop = setInterval(function () {
                        time--;
                        $tips.html(data.message + time + '秒后跳转登录页面');
                        if(time === 0){
                            clearInterval(stop);
                            $registerBox.hide();
                            $loginBox.show();
                        }
                    },1000);
                    $tips.on('click',function () {
                        clearInterval(stop);
                        $registerBox.hide();
                        $loginBox.show();
                    });

                }
            });
        }
    });

    $inputEmail.on('input propertychange',function () {
        if(!$(this).val() && !$password1.val()){
            $tips2.html('');
            $tips2.css('color','#a94442');
        }
    });
    $password1.on('input propertychange',function (){
        if(!$(this).val() && !$inputEmail.val()){
            $tips2.html('');
            $tips2.css('color','#a94442');
        }
    });

    //登录模块
    $loginBox.find('button').on('click',function () {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: '/api/user/login',
            data:{
                username: $loginBox.find('[name = "username"]').val(),
                password: $loginBox.find('[name = "password"]').val()
            },
            dataType: 'json',
            success: function (data) {
                if(data.code === 11){
                    $tips2.html('用户名或者密码不能为空！');
                }else if(data.code === 12){
                    $tips2.html('用户名不存在！');
                }else if(data.code === 13){
                    $tips2.html('密码不正确！');
                }else{
                    $tips2.html('登录成功！');
                    $tips2.css('color','#3c763d');
                    window.location.reload(); //重载页面
                }
            }
        });
    });

    //退出
    $logout.on('click',function () {
        $.ajax({
            url: '/api/user/logout',
            success: function (data) {
                if(!data.code){
                    window.location.reload();
                }
            }
        });
    });


    //登录后的悬浮列表
    $username.mouseover(function () {
        $username.find('#banlist').show();
    });
    $username.mouseout(function () {
        $username.find('#banlist').hide();
    });
});