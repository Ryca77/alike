$(document).ready(function() {

    //send user to instagram authentication
    $('#login').on('click', function() {
        location.href = 'https://www.instagram.com/oauth/authorize/?client_id=7aa0824ae9384b4ab9bbc0ad586af8b7&redirect_uri=https://thinkful-node-capstone-ryca77.c9users.io/authenticate/&scope=public_content+likes&response_type=code';
    });

});