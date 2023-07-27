/// <reference path="./lib/jquery.js"/>

function addPhotoBlock(file){
    var uuid = crypto.randomUUID()
    file.uuid = uuid
    var url = URL.createObjectURL(file.fileObject)
    var date = file.lastModifiedDate.toLocaleDateString([], {year: '2-digit', month: '2-digit', day: '2-digit'})
    var time = file.lastModifiedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    var html = `
    <div class="photoblock" uuid="${uuid}">
            <img src="${url}" alt="">
            <span>${file.name}</span>
            <span>${date} ${time}</span>
    </div>
    `
    photosBar.append(html)
    $("#dnd").hide()
    $(".big-text").show()
    if (selectorRunning == false){
        $("#photos").multiSelector({
            selector: ".photoblock", 
            selectedElementClass: "selected",
            onSelectionEnd: function(list) {
                refreshEditor(list)
            }
        })
        selectorRunning = true
    }
}


async function refreshEditor(list) {
    if (nullEditor){
        $("#editor-null").hide()
        $("#real-editor").show()
        nullEditor = false
    }
    $("#preview").children("img").remove()
    $("#folder-selector").children().remove()
    var currentlyEditingBlocks = list
    var currentlyEditing = Array()
    currentlyEditingBlocks.each(function() {
        var current = photos.find(photo => photo.uuid === $(this).attr('uuid'))
        current.availableListObj = $(this)
        currentlyEditing.push(current)
        // console.log(currentlyEditing)
        var html = `<img src="${URL.createObjectURL(current.fileObject)}" alt="${current.name}" uuid=${current.uuid}>`
        // console.log(html)
        current.editingListObj = $("#preview").append(html).children(":last-child")
    })
    await initTree()
}

async function newFolder(button){

    var ul = button.parent().parent().siblings("ul.nested")
    ul.show()
    button.parent().siblings(".folder-name").css('list-style', '\'\\e2c8\  \'')
    ul.append('<li><div class="folder-block"><input type="text" name="newfoldername" placeholder="New Folder Name"></div></li>').focus().on('keyup', function(e) {
        if (e.which == 13) {
            var newName = $(this).find("input").val()
            ul.children(":last-child").remove()
            var parentNames = Array()
            parentNames.push(button.parent().siblings("span").text())
            var previousParent = button.parent().parent()
            do {
                var currentParent = previousParent.parent().parent()
                if (currentParent[0] != $("#folder-selector")[0]){
                    parentNames.push(currentParent.siblings(".folder-block").children("span").text())
                    previousParent = currentParent
                } else {
                    break
                }
            } while (currentParent.parent().parent()[0] != $("#folder-selector")[0]);
            var path = parentNames.reverse().join('/') + "/" + newName
            postFolderCreation(path).then(res => {
                showToast(res)
                initTree()
            })
        }
    })
}

function postFolderCreation(path){
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: "./api/createDirectory.php",
            type: 'POST',
            data: {
                path: path
            },
            async: true,
            success: function(res) {
                resolve(res)
            }
        })
    })
}

function removeFolder(button){
    var parentNames = Array()
    parentNames.push(button.parent().siblings("span").text())
    var previousParent = button.parent().parent()
    do {
        var currentParent = previousParent.parent().parent()
        if (currentParent[0] != $("#folder-selector")[0]){
            parentNames.push(currentParent.siblings(".folder-block").children("span").text())
            previousParent = currentParent
        } else {
            break
        }
    } while (currentParent.parent().parent()[0] != $("#folder-selector")[0]);
    var path = parentNames.reverse().join('/')
    postFolderDeletion(path).then(res => {
        showToast(res)
        initTree()
    })
}

function postFolderDeletion(path){
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: "./api/removeDirectory.php",
            type: 'POST',
            data: {
                path: path
            },
            async: true,
            success: function(res) {
                resolve(res)
            }
        })
    })
}

function removeSelectedPhotos() {
    const currentlySelected = $("#photos").multiSelector('get')
    currentlySelected.each(function() {
        $(this).remove()
        photos = photos.filter(obj => {
            return obj.uuid !== $(this).attr('uuid')
        })
    })
    if (photos.length == 0){
        $("#dnd").show()
        $(".big-text").hide()
        if (selectorRunning == false){
            $("#photos").multiSelector('unbind')
        }
    }
}

function convertFileToObject(file) {
    return {
        'lastModified'  :   file.lastModified,
        'lastModifiedDate'  :   file.lastModifiedDate,
        'name'  :   file.name,
        'size'  :   file.size,
        'type'  :   file.type,
        'fileObject'    :   file
    }
}

async function initTree() {
    await $.ajax({
        url: "./api/getStructure.php",
        type: 'GET',
        dataType: 'json',
        async: true,
        success: function(structure) {
            $("#folder-selector").children().remove()
            structure.children.forEach(folder => {
                initTreeFolderChildren(folder,$("#folder-selector"))
            })
            $("#folder-selector li.icon").on('dblclick', function() {
                $(this).children("ul.nested").show()
                $(this).css('list-style', '\'\\e2c8\  \'')
            })
            $("#folder-selector li").on('mouseover', function(e){
                e.stopPropagation()
                $("#folder-selector").find("span:contains(\"cancel\")").hide()
            })
            $(".folder-block").on('click', function(e){
                e.stopPropagation()
                $("#folder-selector").find(".selected-folder").toggleClass("selected-folder")
                $(this).addClass("selected-folder")
            })
            $("#folder-selector li.icon").on('mouseover', function(e){
                e.stopPropagation()
                $("#folder-selector").find("span:contains(\"cancel\")").hide()
                if ($(this).children("ul.nested").is(":visible")){
                    $(this).children(".folder-block").children(".folder-options").children("span:contains(\"cancel\")").show()
                }
            })
            $("#folder-selector li.icon").on('mouseleave', function(e){
                $(this).eq(0).children(".folder-block").children(".folder-options").children("span:contains(\"cancel\")").hide()
            })
            $(".folder-options span:contains(\"cancel\")").on('click', function(e){
                e.stopPropagation()
                $(this).parent().parent().siblings("ul.nested").hide()
                $(this).parent().parent().parent().css('list-style', '\'\\e2c7\  \'')
            })
        }
    })
}

function initTreeFolderChildren(folder,currentParentUl){
    if (folder.children.length != 0){
        var currentThing = currentParentUl.append(`<li><div class="folder-block"><span class="folder-name">${folder.name}</span><div class="folder-options"><span class="material-symbols-rounded" style="display: none;">cancel</span><span class="material-symbols-rounded create_folder" onclick="newFolder($(this))">create_new_folder</span></div></div></li>`).children(":last-child")
        currentThing.addClass('icon')
        currentThing.css('list-style', '\'\\e2c7\  \'')
        // currentThing.addClass('material-symbols-rounded')
        var nextParent = currentThing.append(`<ul class="nested"></ul>`).children(":last-child")
        folder.children.forEach(folder => {
            initTreeFolderChildren(folder,nextParent)
        })
    } else {
        var currentThing = currentParentUl.append(`<li><div class="folder-block"><span class="folder-name">${folder.name}</span><div class="folder-options"><span class="material-symbols-rounded create_folder" onclick="removeFolder($(this))">folder_delete</span><span class="material-symbols-rounded create_folder" onclick="newFolder($(this))">create_new_folder</span></div></div></li>`).children(":last-child")
    }
}

$.fn.exists = function () {
    return this.length !== 0;
}

function showToast(res){
    if (!$(".visible-toast").exists()){
        var toast = $(`#${res.type}-toast`)
        if (res.type == 'error'){
            console.error(res.complex_message)
        } else if (res.type == 'info' || res.type == 'success'){
            console.info(res.complex_message)
        }
        toast.find(".toast-message").text(res.message)
        toast.find(".detailed-message").text(res.complex_message)
        toast.removeClass('hidden-toast')
        toast.addClass('visible-toast')
    } else {
        replaceToast(res)
    }
}

function replaceToast(res){
    var initialToast = $(".visible-toast")
    $("#toast-hider").show()
    initialToast.removeClass('visible-toast')
    initialToast.addClass('hidden-toast')
    initialToast.find(".toast-message").text('')
    initialToast.find(".detailed-message").text('')
    setTimeout(() => {
        $("#toast-hider").hide()
        showToast(res)
    }, 500)
}

function hideToast(){
    var toast = $(".visible-toast")
    try {
        toast.removeClass('visible-toast')
        toast.addClass('hidden-toast')
        setTimeout(() => {
            toast.find(".toast-message").text('')
            toast.find(".detailed-message").text('')
        }, 500);
    }
    catch {}
}

async function copyToastMessage(button) {
    var firstLine = button.parent().siblings("div").children(".toast-message").text()
    var secondLine = button.parent().siblings("div").children(".detailed-message").text()
    var message = firstLine + "\n" + secondLine
    if (!navigator.clipboard) {
        console.error('Clipboard API not available in this browser : please make sure you are using a secure scheme or serving with localhost');
        return;
    }
    navigator.permissions.query({ 
        name: 'clipboard-write'
    }).then(result => {
        if (result.state === 'granted' || result.state === 'prompt') {
            navigator.clipboard.writeText(message)
        } else {
            console.error("Copy error : permission 'clipboard-write' denied. Please allow access to clipboard.");
            showToast('error', "Couldn't copy : permission denied")
        }
    });
}

// $(window).on('load',function() {
//     $('.material-icons-rounded').css('display','inline');
// });

let photos = Array()
var photosBar = $("#photos")
var selectorRunning = false
var nullEditor = true

$("#photo-panel-big").hide();

setTimeout(() => {
    $("#toast-hider").hide()
}, 2000);

$("#dnd").on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
});

$("#dnd").on('drop', function (e) {
    var justImportedPhotos = Array.from(e.originalEvent.dataTransfer.files)
    justImportedPhotos.forEach(file => {
        var jsonFile = convertFileToObject(file)
        photos.push(jsonFile)
        addPhotoBlock(jsonFile)
    })
});

$("#filebrowser")[0].onchange = evt => {
    var justImportedPhotos = Array.from($("#filebrowser")[0].files)
    justImportedPhotos.forEach(file => {
        var jsonFile = convertFileToObject(file)
        photos.push(jsonFile)
        addPhotoBlock(jsonFile)
    })
}