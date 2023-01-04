/* 딕셔너리 형태로 csv 데이터 속성 기반 정리, 각 value들은 str이므로 사용 시 형변환 필요
dist : 거리
status_img : 도로현황
surf_img : 도로표면
pd : 소성변형 (plastic deformation)
roughness : 종단평탄성
latlng : 위도 , 경도
amount_crack : 균열량
ratio_crack : 균열율
SPI_1,2,3 : 도시고속도로, 주간선도로,보조간선도로
AP_L : 종방향균열(longitude) // 각 L M H 순
AP_T : 횡방향균열(transverse)
AP_CJ : 시공줄눈(construction joint)
AP_AC : 거북등균열 (Aligator crack)
AP_P : 패칭
AP_H : 포트홀
note : 비고
w : 분석 관심 폭
*/
let csv_data = []

// 지도생성
let mapContainer = document.getElementById('map'), // 지도를 표시할 div  
    mapOption = { 
        center: new kakao.maps.LatLng(37.47776614,126.8913644), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };
let map = new kakao.maps.Map(mapContainer, mapOption);


// 마커생성
function createMarkers() {
    let imageSrc = "../redcircle.png";
    let imageSize = new kakao.maps.Size(12, 12);
    let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
    for (var i = 0; i < csv_data.length; i++)
    {
        let position = new kakao.maps.LatLng(parseFloat(csv_data[i].latlng[0]),parseFloat(csv_data[i].latlng[1]))
        let marker = new kakao.maps.Marker({
        map: map,
        position: position,
        image: markerImage,
        clickable : true
        });
        let iwContent = '<img src ='+ '../가산로(2103)_하_2_2/가산로(2103)_하_2_2_도로현황/D810/Camera1/0/'+ csv_data[i].status_img + ' height = "200" width = "180">'
        let iwRemoveable = true;
        let infowindow = new kakao.maps.InfoWindow({
            content : iwContent,
            removable : iwRemoveable,
            position : position
        });

        kakao.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);  
        });
    }
}



// csv 읽는 Ajax call
$(function() {
let fileName = "pont.csv";
$.ajax({
    url: fileName,
    dataType: "text",
    success: function(data)
    {   
        let allRow = data.split("\n");
        for (let i = 14; i< allRow.length -1 ; i++)
        {
            let column = allRow[i].split(",")
            csv_data.push({dist : column[0], status_img : column[1], surf_img : column[2], pd : column[3], roughness : column[4], latlng : [column[5], column[6]],
             amount_crack : column[7], ratio_crack : column[8], SPI_1 : column[9], SPI_2 : column[10], SPI_3 : column[11], AP_L : [column[12], column[13], column[14]],
             AP_T : [column[15],column[16],column[17]], AP_CJ : [column[18],column[19],column[20]], AP_AC : [column[21],column[22],column[23]],
             AP_P : [column[24],column[25],column[26]], AP_H : [column[27],column[28],column[29]], note : column[30], w : column[31]})  
        }

        createMarkers();
    }
    });
});