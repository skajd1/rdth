let mapContainer = document.getElementById('map'), // 지도를 표시할 div  
    mapOption = { 
        center: new kakao.maps.LatLng(37.47776614,126.8913644), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };

let map = new kakao.maps.Map(mapContainer, mapOption); // 지도 생성
let lattitude = [];
let longitude = [];
let positions = [];
let img_path_roadstatus = "C:/Users/Roadtech/Documents/folder/가산로(2103)_하_2_2/가산로(2103)_하_2_2_도로현황/D810/Camera1/0/"
let img_path_result = ''
let csv_data
function createMarkers() {
    let imageSrc = "../redcircle.png";
    let imageSize = new kakao.maps.Size(12, 12);
    let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
  
    for (var i = 0; i < positions.length; i++)
    {
        let marker = new kakao.maps.Marker({
        map: map,
        position: positions[i].latlng,
        image: markerImage,
        clickable : true
        });
        let iwContent = '<img src ='+ '../가산로(2103)_하_2_2/가산로(2103)_하_2_2_도로현황/D810/Camera1/0/'+ column[1] + ' height = "280" width = "180">' // <img src = img_path_roadstatus + column[1]>
        console.log(iwContent)
        let iwRemoveable = true;
        let infowindow = new kakao.maps.InfoWindow({
            content : iwContent,
            removable : iwRemoveable,
            position : positions[i].latlng
        });

        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);  
        });
    }
}
  
$(function() {
let fileName = "pont.csv";
$.ajax({
    url: fileName,
    dataType: "text",
    success: function(data)
    {   
        let allRow = data;
        allRow = allRow.split("\n");
        for (let i = 14; i < allRow.length - 1; i++) {
            column = allRow[i].split(",");
            lattitude.push(parseFloat(column[5]));
            longitude.push(parseFloat(column[6]));
            position_tmp = { latlng: new kakao.maps.LatLng(parseFloat(column[5]), parseFloat(column[6]))};
            positions.push(position_tmp);
        }

        createMarkers();
    }
    });
});