$(document).ready(function (e) {
  //var tc = new timeControl();
  //tc.startClockUpdate();
  update();
  setInterval(function() { updateImages() }, 60000);
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  $("#historico").hide();
  hideVideos();
});

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
            $('#video-list').append('<center>'+ data[i] +'<br><div id="' + id + '"></center><br>');
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
  hideVideos();
  $("#GraphsGrid").show();
});

$("#lhistorico").click(function() {
  $("#GraphsGrid").hide();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  hideVideos();
  $("#historico").show();
  fillNodesOptions();
});

$("#lstream").click(function() {
  $("#GraphsGrid").hide();
  $("#historico").hide();
  $("#imagens-cam").hide();
  hideVideos();
  $("#strobeMediaPlayback").show();
});

$("#lpictures").click(function() {
  $("#GraphsGrid").hide();
  $("#historico").hide();
  $("#strobeMediaPlayback").hide();
  hideVideos();
  $("#imagens-cam").show();
  updateImages();
});

$("#lvideos").click(function() {
    $("#GraphsGrid").hide();
    $("#historico").hide();
    $("#strobeMediaPlayback").hide();
    $("#imagens-cam").hide();
    showVideos();
});

var images_file = {}

function updateImages() {
     $.get('pictures').success(
    function(data) {
        data = data.split('<br>');
        var folder = data.pop().replace(' ', '');
        for (var i = 0; i < data.length; i++) {
          var value = data[i].split('&');
          value[0] = value[0].replace(' ', '');
          if (!(value[0] in images_file)) {
              images_file[value[0]] = true;
              path = "imagens/" + folder + "/" + value[0];
              $("#imagens-cam").prepend('<center><p>' + value[1] + '</p><img src="' + path + '"><center><br>');
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
