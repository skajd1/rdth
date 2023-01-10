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
            "radio-all": marker_blue,
            "radio-SPI1": get_color_SPI(parseFloat(csv_data[i].SPI_1)),
            "radio-SPI2": get_color_SPI(parseFloat(csv_data[i].SPI_2)),
            "radio-SPI3": get_color_SPI(parseFloat(csv_data[i].SPI_3)),
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
<<<<<<< HEAD
            createMarkers('all');
            setDistance();
            setText(getAvg(ColumnData.pd), "avg-pd");
            setText(getAvg(ColumnData.roughness), "avg-rough");
            makeTable(csv_data);
=======
            createMarkers('radio-all');
            valueInitialize()
            makeTable(csv_data);

            
>>>>>>> master
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


function valueInitialize()
{   
    for(let key of Object.keys(csv_data[0]))
    {
        if (key ==='w' || key ==='note' || key === 'status_img' || key === 'surf_img' || key === 'latlng')
        {
            continue;
        }
        else if (key === 'dist')
        {
            setText(getSum(ColumnData.dist).toFixed(3),"dist");
        }
        else if (key ==='AP_L' || key === 'AP_T'|| key === 'AP_CJ'|| key === 'AP_AC'|| key === 'AP_P'|| key === 'AP_H')
        {
            
            for(let j = 0 ; j < 3 ; j ++)
            {   
                let id = key+"_"+(j+1)
                let sum = 0;
                for(let i = 0 ; i < csv_data.length; i++)
                {
                    sum += parseFloat(ColumnData[key][i][j]);
                }
                setText(sum.toFixed(3),id)
            }     
        }
        else
        {
            setText(getAvg(ColumnData[key]).toFixed(3),key)
        }

    }

}

function getSum(data_array)
{   
    let sum = 0;
    for(let i = 0 ; i < csv_data.length ; i ++)
    {
        sum += parseFloat(data_array[i])
    }
    return sum;
}
function getAvg(data_array)
{
    /*data_array(type:array) 받아들여 return 값으로 평균을 내주는 함수*/
    let sum = 0;
    for(let i = 0; i < csv_data.length; i ++)
    {
        sum += parseFloat(data_array[i])
    }
    return (sum / csv_data.length) ;
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

<<<<<<< HEAD
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

		let td100 = document.createElement("td");			  
		td100.appendChild(document.createTextNode(ColumnData.dist[i] + ""));
		let td200 = document.createElement("td");			 
		td200.appendChild(document.createTextNode(ColumnData.note[i] + ""));
		let td300 = document.createElement("td");			 
		td300.appendChild(document.createTextNode(ColumnData.w[i]+ ""));
		let td400 = document.createElement("td");			 
		td400.appendChild(document.createTextNode(ColumnData.AP_L[i][0]+ ""));
        let td500 = document.createElement("td");
        td500.appendChild(document.createTextNode(ColumnData.AP_L[i][1] + ""));
		let td600 = document.createElement("td");			 
		td600.appendChild(document.createTextNode(ColumnData.AP_L[i][2]+ ""));
		let td700 = document.createElement("td");			 
		td700.appendChild(document.createTextNode(ColumnData.AP_T[i][0]+ ""));
        let td800 = document.createElement("td");
        td800.appendChild(document.createTextNode(ColumnData.AP_T[i][1] + ""));
		let td900 = document.createElement("td");			 
		td900.appendChild(document.createTextNode(ColumnData.AP_T[i][2]+ ""));
        let td1000 = document.createElement("td");			 
		td1000.appendChild(document.createTextNode(ColumnData.AP_CJ[i][0]+ ""));
        let td1100 = document.createElement("td");
        td1100.appendChild(document.createTextNode(ColumnData.AP_CJ[i][1] + ""));
		let td1200 = document.createElement("td");			 
		td1200.appendChild(document.createTextNode(ColumnData.AP_CJ[i][2]+ ""));
        let td1300 = document.createElement("td");			 
		td1300.appendChild(document.createTextNode(ColumnData.AP_AC[i][0]+ ""));
        let td1400 = document.createElement("td");
        td1400.appendChild(document.createTextNode(ColumnData.AP_AC[i][1] + ""));
		let td1500 = document.createElement("td");			 
		td1500.appendChild(document.createTextNode(ColumnData.AP_AC[i][2]+ ""));
        let td1600 = document.createElement("td");			 
		td1600.appendChild(document.createTextNode(ColumnData.AP_P[i][0]+ ""));
        let td1700 = document.createElement("td");
        td1700.appendChild(document.createTextNode(ColumnData.AP_P[i][1] + ""));
		let td1800 = document.createElement("td");			 
		td1800.appendChild(document.createTextNode(ColumnData.AP_P[i][2]+ ""));
        let td1900 = document.createElement("td");			 
		td1900.appendChild(document.createTextNode(ColumnData.AP_H[i][0]+ ""));
        let td2000 = document.createElement("td");
        td2000.appendChild(document.createTextNode(ColumnData.AP_H[i][1] + ""));
		let td2100 = document.createElement("td");			 
		td2100.appendChild(document.createTextNode(ColumnData.AP_H[i][2]+ ""));


		tr.appendChild(td100);
		tr.appendChild(td200);
		tr.appendChild(td300);
        tr.appendChild(td400);
		tr.appendChild(td500);
		tr.appendChild(td600);
        tr.appendChild(td700);
		tr.appendChild(td800);
		tr.appendChild(td900);
        tr.appendChild(td1000);
        tr.appendChild(td1100);
        tr.appendChild(td1200);
        tr.appendChild(td1300);
        tr.appendChild(td1400);
        tr.appendChild(td1500);
        tr.appendChild(td1600);
        tr.appendChild(td1700);
        tr.appendChild(td1800);
        tr.appendChild(td1900);
        tr.appendChild(td2000);
        tr.appendChild(td2100);
		table2.appendChild(tr);
	}
}
=======
function makeTable(jsonData) {

    let table = document.getElementById('cb3-table-body');
    let table_head = ["dist","note","w","pd","roughness","amount_crack","ratio_crack","SPI_1","SPI_2",
"SPI_3","AP_L","AP_L","AP_L","AP_T","AP_T","AP_T","AP_CJ","AP_CJ","AP_CJ","AP_AC","AP_AC","AP_AC","AP_P","AP_P","AP_P","AP_H","AP_H","AP_H"];

    for(i=0; i<csv_data.length; i++){
		let tr = document.createElement("tr");
        for (let head of table_head)
        {
            let td = document.createElement("td")
            td.appendChild(document.createTextNode(ColumnData[head][i]+ ""));
            tr.appendChild(td)
        }
		table.appendChild(tr);
	}

}
>>>>>>> master
