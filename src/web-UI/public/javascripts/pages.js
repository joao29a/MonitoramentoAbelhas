$(document).ready(function (e) {
  //var tc = new timeControl();
  //tc.startClockUpdate();
  update();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  $("#historico").hide();
});


$("#ltempoReal").click(function() {
  $("#historico").hide();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  $("#GraphsGrid").show();
});

$("#lhistorico").click(function() {
  $("#GraphsGrid").hide();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").hide();
  $("#historico").show();
  fillNodesOptions();
});

$("#lstream").click(function() {
  $("#GraphsGrid").hide();
  $("#historico").hide();
  $("#imagens-cam").hide();
  $("#strobeMediaPlayback").show();
});

var images_file = {}

$("#lpictures").click(function() {
  $("#GraphsGrid").hide();
  $("#historico").hide();
  $("#strobeMediaPlayback").hide();
  $("#imagens-cam").show();
  $.get('pictures').success(
      function(data) {
          data = data.split('<br>');
          data.pop();
          for (var i in data) {
            data[i] = data[i].replace(' ', '');
            if (!(data[i] in images_file)) {
                images_file[data[i]] = true;
                path = "imagens/" + data[i];
                $("#imagens-cam").append('<center><img src="' + path + '"><center><br>');
            }
          }
      });
});

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
