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
let csv_data = [];
let marker = [];
let infoWindows = [];
let ColumnData = {};
let marker_green = "./greencircle.png";
let marker_orange = "./orangecircle.png";
let marker_red = "./redcircle.png";
let marker_yellow = "./yellowcircle.png";
let marker_blue = './bluecircle.png';
 


// 지도생성 / 나중에 함수에 넣은 뒤 AJAX Call 에서 호출하게 하면 센터 및 크기레벨 동적제어 가능
let mapContainer = document.getElementById('map'), // 지도를 표시할 div  
    mapOption = {
        center: new kakao.maps.LatLng(37.47776614, 126.8913644), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };

let map = new kakao.maps.Map(mapContainer, mapOption);

var mapTypeControl = new kakao.maps.MapTypeControl();
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);


function get_color_SPI(num) {
    if (num <= 2) {
        return marker_red;
    }
    else if (num <= 4) {
        return marker_orange;
    }
    else if (num <= 6) {
        return marker_yellow;
    }
    else if (num <= 8) {
        return marker_green;
    }
    else {
        return marker_blue
    }
}
function createIw()
{
 for (let i = 0; i < csv_data.length; i++)
 {
    let position = new kakao.maps.LatLng(parseFloat(csv_data[i].latlng[0]), parseFloat(csv_data[i].latlng[1]))
    let iwContent = '<div><p>거리 : ' + csv_data[i].dist + '</p><p>비고 : ' + csv_data[i].note + '</p></div>' // 인포 윈도우 내용 설정
    let infowindow = new kakao.maps.InfoWindow({
        content: iwContent,
        removable: true,
        position: position
    });
    infoWindows.push(infowindow);
 }
    
}
function deleteIw(iws) {
    if (iws.length !== 0) {
        for (let iw of iws) {
            iw.close()
        }
    }
}
function createMarkers(select) {

    deleteIw(infoWindows)
    deleteMarkers(marker)
    marker = []


    let markerSize = new kakao.maps.Size(10, 10);

    for (let i = 0; i < csv_data.length; i++) {
        let position = new kakao.maps.LatLng(parseFloat(csv_data[i].latlng[0]), parseFloat(csv_data[i].latlng[1]))

        let markercolor =
        {
            "all": marker_blue,
            "SPI1": get_color_SPI(parseFloat(csv_data[i].SPI_1)),
            "SPI2": get_color_SPI(parseFloat(csv_data[i].SPI_2)),
            "SPI3": get_color_SPI(parseFloat(csv_data[i].SPI_3)),
        }

        let markerImage = new kakao.maps.MarkerImage(markercolor[select], markerSize)
        marker[i] = new kakao.maps.Marker({
            map: map,
            position: position,
            image: markerImage,
            clickable: true
        });

        let status_img_src = './가산로(2103)_하_2_2/가산로(2103)_하_2_2_도로현황/D810/Camera1/0/' + csv_data[i].status_img
        let surf_img_src = './가산로(2103)_하_2_2/가산로(2103)_하_2_2_U_net-result/0/' + csv_data[i].surf_img

        // 클릭 리스너, 다른 차트와 연동할 때 사용
        kakao.maps.event.addListener(marker[i], 'click', function () {
            deleteIw(infoWindows)
            infoWindows[i].open(map, marker[i]); // 클릭할 때 인포 윈도우 생성
            document.getElementById("status_img").src = status_img_src; // 도로 현황 이미지 변경
            document.getElementById("surf_img").src = surf_img_src; // 도로 표면 이미지 변경
            map.setCenter(position) // 선택한 마커 중심으로 맵 이동
        }
        );
    }
}
function deleteMarkers(marker) {
    if (marker.length !== 0) {
        for (let i = 0; i < csv_data.length; i++) {
            marker[i].setMap(null);
        }
    }

}


// csv 읽는 Ajax call
$(function () {
    let fileName = "pont.csv";
    $.ajax({
        url: fileName,
        dataType: "text",
        success: function (data) {
            let allRow = data.split("\n");
            for (let i = 14; i < allRow.length - 1; i++) {
                let column = allRow[i].split(",")
                csv_data.push({
                    dist: column[0], status_img: column[1], surf_img: column[2], pd: column[3], roughness: column[4], latlng: [column[5], column[6]],
                    amount_crack: column[7], ratio_crack: column[8], SPI_1: column[9], SPI_2: column[10], SPI_3: column[11], AP_L: [column[12], column[13], column[14]],
                    AP_T: [column[15], column[16], column[17]], AP_CJ: [column[18], column[19], column[20]], AP_AC: [column[21], column[22], column[23]],
                    AP_P: [column[24], column[25], column[26]], AP_H: [column[27], column[28], column[29]], note: column[30], w: column[31]
                })
            }
            for (let key of Object.keys(csv_data[0]) )
            {   
                ColumnData[key] = [];
                for(let i = 0 ; i < csv_data.length ; i ++)
                {
                    ColumnData[key].push(csv_data[i][key])
                }
            }
            
            // 여기에 함수 추가.
            createIw();
            createMarkers('all');
            setDistance();
            setText(getAvg(ColumnData.pd), "avg-pd");
            setText(getAvg(ColumnData.roughness), "avg-rough");
            makeTable(csv_data);
        }
    });
});

$( function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 500,
      values: [0,500],
      slide: function( event, ui ) {
        $( "#amount" ).val(ui.values[0] + " - " + ui.values[1]);
      }
    });
    $( "#amount" ).val($( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 ) );    
  });




function setDistance()
{   
    let sum = 0;
    for(let i = 0 ; i < csv_data.length ; i ++)
    {
        sum += parseFloat(ColumnData.dist[i])
    }
    document.getElementById("distance").innerText = sum
}
function getAvg(data_array)
{
    /*data_array(type:array) 받아들여 return 값으로 평균을 내주는 함수*/
    let sum = 0;
    for(let i = 0; i < csv_data.length; i ++)
    {
        sum += parseFloat(data_array[i])
    }
    return sum / csv_data.length ;
}
function setText(value, ID)
{
    /* value 값을 받아들여 html ID에 text 형식으로 넘겨주는 함수
    */
    document.getElementById(ID).innerText = value
}
/* 딕셔너리 형태로 csv 데이터 속성 기반 정리, 각 value들은 str이므로 사용 시 형변환 필요
dist : 거리 1
status_img : 도로현황
surf_img : 도로표면
pd : 소성변형 (plastic deformation) 4
roughness : 종단평탄성 5 
latlng : 위도 , 경도
amount_crack : 균열량 6
ratio_crack : 균열율 7
SPI_1,2,3 : 도시고속도로, 주간선도로,보조간선도로 8 9 10
AP_L : 종방향균열(longitude) // 각 L M H 순 4 5 6
AP_T : 횡방향균열(transverse) 7 8 9
AP_CJ : 시공줄눈(construction joint) 10 11 12
AP_AC : 거북등균열 (Aligator crack) 13 14 15
AP_P : 패칭 16 17 18
AP_H : 포트홀 19 20 21
note : 비고 2
w : 분석 관심 폭 3
*/
function makeTable(jsonData) {

    let table = document.getElementById('table1');

    for(i=0; i<csv_data.length; i++){
		let tr = document.createElement("tr");
		
		let td1 = document.createElement("td");			  
		td1.appendChild(document.createTextNode(ColumnData.dist[i] + ""));
		
		let td2 = document.createElement("td");			 
		td2.appendChild(document.createTextNode(ColumnData.note[i] + ""));
		
		let td3 = document.createElement("td");			 
		td3.appendChild(document.createTextNode(ColumnData.w[i]+ ""));

		let td4 = document.createElement("td");			 
		td4.appendChild(document.createTextNode(ColumnData.pd[i]+ ""));

        let td5 = document.createElement("td");
        td5.appendChild(document.createTextNode(ColumnData.roughness[i] + ""));

		let td6 = document.createElement("td");			 
		td6.appendChild(document.createTextNode(ColumnData.amount_crack[i]+ ""));
		let td7 = document.createElement("td");			 
		td7.appendChild(document.createTextNode(ColumnData.ratio_crack[i]+ ""));
        let td8 = document.createElement("td");			 
		td8.appendChild(document.createTextNode(ColumnData.SPI_1[i]+ ""));
        let td9 = document.createElement("td");			 
		td9.appendChild(document.createTextNode(ColumnData.SPI_2[i]+ ""));
        let td10 = document.createElement("td");			 
		td10.appendChild(document.createTextNode(ColumnData.SPI_3[i]+ ""));

		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
        tr.appendChild(td4);
		tr.appendChild(td5);
		tr.appendChild(td6);
        tr.appendChild(td7);
		tr.appendChild(td8);
		tr.appendChild(td9);
        tr.appendChild(td10);


		table.appendChild(tr);
	}

    let table2 = document.getElementById('table2');

    for(i=0; i<csv_data.length; i++){
		let tr = document.createElement("tr");
		let td1 = document.createElement("td");			  
		td1.appendChild(document.createTextNode(ColumnData.dist[i] + ""));
		let td2 = document.createElement("td");			 
		td2.appendChild(document.createTextNode(ColumnData.note[i] + ""));
		let td3 = document.createElement("td");			 
		td3.appendChild(document.createTextNode(ColumnData.w[i]+ ""));
		let td4 = document.createElement("td");			 
		td4.appendChild(document.createTextNode(ColumnData.pd[i]+ ""));
        let td5 = document.createElement("td");
        td5.appendChild(document.createTextNode(ColumnData.roughness[i] + ""));
		let td6 = document.createElement("td");			 
		td6.appendChild(document.createTextNode(ColumnData.amount_crack[i]+ ""));
		let td7 = document.createElement("td");			 
		td7.appendChild(document.createTextNode(ColumnData.ratio_crack[i]+ ""));
        let td8 = document.createElement("td");			 
		td8.appendChild(document.createTextNode(ColumnData.SPI_1[i]+ ""));
        let td9 = document.createElement("td");			 
		td9.appendChild(document.createTextNode(ColumnData.SPI_2[i]+ ""));
        let td10 = document.createElement("td");			 
		td10.appendChild(document.createTextNode(ColumnData.SPI_3[i]+ ""));
        
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
        tr.appendChild(td4);
		tr.appendChild(td5);
		tr.appendChild(td6);
        tr.appendChild(td7);
		tr.appendChild(td8);
		tr.appendChild(td9);
        tr.appendChild(td10);
		table.appendChild(tr);
	}
}
