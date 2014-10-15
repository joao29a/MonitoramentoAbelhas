$(document).ready(function (e) {
  //var tc = new timeControl();
  //tc.startClockUpdate();
  update();
  setInterval(function() { updateImages() }, 60000);
  getPicturesFolders();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  $("#historico").hide();
  $("#imagens-list").hide();
  $('#portao-id').hide();
  hideVideos();
});

function getPicturesFolders(){
    $.get('pictures').success(function(data){
        data = data.split('&');
        data.pop();
        var divList = document.getElementById('imagens-list');
        var select = document.createElement('select');
        select.id = 'imagens-select-id';
        select.onchange = updateImages;
        divList.appendChild(select);
        for (var i = data.length - 1; i >= 0; i--) {
            var option = document.createElement('option');
            option.value = data[i];
            var text = document.createTextNode(data[i]);
            option.appendChild(text);
            select.appendChild(option);
        }
    });
}

function hideVideos() {
   $('#video-list').empty();
}

function showVideos() {
    $.get('videos').success(function(data) {
        data = data.split('&');
        data.pop();
        for (var i in data) {
            data[i] = data[i].replace(' ', '');
            var id = "strobeMediaPlayback" + i;
            $('#video-list').append('<center>'+ data[i] +'<a href="/javascripts/smp/videos/' + data[i]
                + '"><button type="button">Download</button><br><div id="' + id + '"></center><br>');
            var parameters = { 
                 src: "videos/" + data[i], 
                          autoPlay: false, 
                 controlBarAutoHide: false, 
                 playButtonOverlay: true, 
                 showVideoInfoOverlayOnStartUp: false, 
                          optimizeBuffering : false, 
                          initialBufferTime : 0.1, 
                          expandedBufferTime : 0.1, 
                          minContinuousPlayback : 0.1, 
               };

              swfobject.embedSWF
                 ( "javascripts/smp/StrobeMediaPlayback.swf"
                 , id
                 , 800 
                 , 430 
                 , "10.0"
                 , {}
                 , parameters
                 , { allowFullScreen: "true"}
                 , { name: id }
                 );
            }
        });
}

$("#ltempoReal").click(function() {
  $("#historico").hide();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  $("#imagens-list").hide();
  $('#portao-id').hide();
  hideVideos();
  $("#GraphsGrid").show();
});

$("#lhistorico").click(function() {
  $("#GraphsGrid").hide();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  $("#imagens-list").hide();
  $('#portao-id').hide();
  hideVideos();
  $("#historico").show();
  fillNodesOptions();
});

$("#lstream").click(function() {
  $("#GraphsGrid").hide();
  $("#historico").hide();
  $("#imagens-cam").hide();
  $("#imagens-list").hide();
  $('#portao-id').show();
  hideVideos();
  $("#strobeMediaPlayback").show();
});

$("#lpictures").click(function() {
  $("#GraphsGrid").hide();
  $("#historico").hide();
  $("#strobeMediaPlayback").hide();
  $('#portao-id').hide();
  hideVideos();
  $("#imagens-cam").show();
  $("#imagens-list").show();
  updateImages();
});

$("#lvideos").click(function() {
    $("#GraphsGrid").hide();
    $("#historico").hide();
    $("#strobeMediaPlayback").hide();
    $("#imagens-cam").hide();
    $("#imagens-list").hide();
    $('#portao-id').hide();
    showVideos();
});

var images_file = {}
var images_folder = null

function updateImages() {
    var select = document.getElementById('imagens-select-id');
    var folder = select.options[select.selectedIndex].value;
    folder = folder.replace(' ', '');
    $.get('pictures/'+folder).success(
    function(data) {
        data = data.split('<br>');
        folder = data.pop().replace(' ', '');
        if (folder != images_folder) {
            images_folder = folder;
            for (var i in images_file) {
                delete images_file[i];
            }
            $('#imagens-cam').empty();
        }
        for (var i = data.length - 1; i >= 0; i--) {
          var value = data[i].split('&');
          value[0] = value[0].replace(' ', '');
          if (!(value[0] in images_file)) {
              images_file[value[0]] = true;
              path = "imagens/" + folder + "/" + value[0];
              $("#imagens-cam").append('<center><p>' + value[1] + '</p><img src="' + path + '"><center><br>');
          }
        }
    });
}

$("#lexportar").click(function() {
  if (!is_loading) {
    is_loading = true;
    $("#loading").show();
    var mode = "all";
    $.get('exportData/'+mode).success(
      function(data) {
        saveOnFile(data);
      });
    $("#loading").hide();
    is_loading = false;
  }
  else alertLoading();
});

$("#llimpar").click(function() {
  if (confirm('Você deseja apagar todos os dados?')) {
    var mode = "all";
    $.get('deleteData/'+mode).success(
      function(data) {
        alert("Todos os dados foram deletados com sucesso.");
      });
    }
});

$("#addHist").click(function() {
  $("#HistoricGrid").empty();
  addHistoric($("#nodesBox").val()); 
});

$('#portao-button').click(function() {
    $.get('gate').success(function(data) {
        $('#portao-id').fadeOut(500);
        $('#portao-id').fadeIn(500);
    });
});
