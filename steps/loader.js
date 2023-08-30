if (sessionStorage.getItem('step') == null){
    sessionStorage.setItem('step', 'editing')
}
$.get('./steps/editing/editing.php', function(data){
    $("body").append($(data).hide())
    setTimeout(function(){
        $("body").children().not("link, script").show()
        $("#loader").fadeTo("slow", 0, function(){
            $("#loader").hide()
        })
    },5000)
})

function changeStep(step){
    sessionStorage.setItem('step', step)
    $("body").find('*').not("#loader, .spinner").remove()
    $("#loader").fadeTo('slow', 1, function(){
        var loadURL = './steps/' + step + '/' + step + '.php'
        $.get(loadURL, function(data){
            $("body").append($(data).hide())
            setTimeout(function(){
                $("body").children().not("link, script").show()
                $("#loader").fadeTo("slow", 0, function(){
                    $("#loader").hide()
                })
            }, 3000)
        })
    })
}

window.onbeforeunload = function(event){
    if (logoutCount == 0){
        return 'Are you sure you want to reload ?'
    }
}

window.onunload = function(event){
    if (logoutCount == 0){
        $.ajax({
            url: './api/emptySessionPhotos.php',
            type: 'GET'
        })
    }
}