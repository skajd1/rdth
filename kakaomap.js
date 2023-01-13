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
const csv_data = [];      // object[arr]
let marker = [];        // object[arr] 생성된 maker들 모임
let infoWindows = [];   // object[arr] 생성된 infoWindeow들 모임
const ColumnData = {};    // obejct[object]
const markerSize = new kakao.maps.Size(10, 10);
const marker_green = "./greencircle.png";
const marker_orange = "./orangecircle.png";
const marker_red = "./redcircle.png";
const marker_yellow = "./yellowcircle.png";
const marker_blue = './bluecircle.png';
let selected = -1
const myChart = {};       // obejct[object]  {{'ChartName' : 'new Chart()'}, ... }
let currently_radio_type = "radio-All";   // string 현제 선택된 도로상태유형을 저장. "radio-[딕셔너리의 key값들]"
let mapContainer = document.getElementById('map'), // 지도를 표시할 div  
    mapOption = {
        center: new kakao.maps.LatLng(37, 125), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };

let map = new kakao.maps.Map(mapContainer, mapOption);
var mapTypeControl = new kakao.maps.MapTypeControl();
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
let csv_data_length;    //csv_data.lenght 값을 저장.

/** 지도의 레벨을 내리는 함수. (지도를 축소) */
function zoomIn() {

    // 현재 지도의 레벨을 얻어옵니다
    var level = map.getLevel();

    // 지도를 1레벨 내립니다
    map.setLevel(level - 1);
}

/** 지도의 레벨을 올리는 함수. (지도를 확대) */
function zoomOut() {

    // 현재 지도의 레벨을 얻어옵니다
    var level = map.getLevel();

    // 지도를 1레벨 올립니다 (지도가 확대됩니다)
    map.setLevel(level + 1);

}

/** SPI의 marker에 맞는 색상을 줌.
 * return url[string]
 */
function getColor(num) {

    if (num <= 2 && num >= 0) { return marker_red; }
    else if (num <= 4) { return marker_orange; }
    else if (num <= 6) { return marker_yellow; }
    else if (num <= 8) { return marker_green; }
    else { return marker_blue }
}

/** infoWindow를 생성하는 함수. */
function createIw() {

    for (let i = 0; i < csv_data_length; i++) {
        let position = new kakao.maps.LatLng(parseFloat(csv_data[i].latlng[0]), parseFloat(csv_data[i].latlng[1]))
        let iwContent = `<div><p>거리 : ${csv_data[i].dist}</p><p>비고 : ${csv_data[i].note}</p></div>` // 인포 윈도우 내용 설정
        let infowindow = new kakao.maps.InfoWindow({
            position: position,
            content: iwContent,
            removable: true
        });
        infoWindows.push(infowindow);
    }
}

/** array를 받아 저장된 object(infoWindow)를 제거하는 함수 
 * input object[arr]
*/
function deleteIw(iws) {

    if (iws.length !== 0) {
        for (let iw of iws) {
            iw.close()
        }
    }
}


/** 현제 선택된 radio의 설정에 맞는 slider를 설정하는 함수
 * html selectbox에서 버튼을 누를때마다 호출
 * input id[string]
 */
function setSlider(getId) {

    currently_radio_type = getId;
    $(setMarkerImage());
    if (currently_radio_type === "radio-All") {
        document.getElementById("select_range").style.visibility = 'hidden';
    }
    else if (["radio-SPI_1", "radio-SPI_2", "radio-SPI_3"].includes(currently_radio_type)) {
        document.getElementById("select_range").style.visibility = 'visible';
        makeSliderAndAmount(true, 0, 10, 2, [0, 10]);
    }
    else {
        document.getElementById("select_range").style.visibility = 'visible';
        makeSliderAndAmount(true, 0, 10, 1, [0, 10]);
    }
}

/** 받아들인 정보로 slider와 amount를 생성하는 함수
 * input range[boolen], number, number, number, number[arr]
 */
function makeSliderAndAmount(range, min, max, step, values) {
    
    $("#slider-range").slider({
        range: range,
        min: min,
        max: max,
        step: step,
        values: values,
        opacity: 1,
        change: function (event, ui) {   // 슬라이더의 움직임에 반응하는 값or함수들 모음
            $("#amount").val(ui.values[0] + " - " + ui.values[1]);
            $(setMarkerOpacityByScale(ui.values));
        }
    });
    $("#amount").val($("#slider-range").slider("values", 0) + " - " + $("#slider-range").slider("values", 1));
}

/** slider에서 지정된 범위 scales[array]의 조건에 맞는 marker의 선명도(opacity)를 설정 
 * input slider.ui.values[arr]
*/
function setMarkerOpacityByScale(scales) {
    
    let cnt = 0;
    if (currently_radio_type !== 'radio-All') {
        for (let i of ColumnData[currently_radio_type.split('-')[1]]) {
            (scales[0] > i || scales[1] < i) ? marker[cnt].setOpacity(0.15) : marker[cnt].setOpacity(1);
            ++cnt;
        }
    }
}

/** Radio에서 선택되면 marker를 만들고 설정하는 함수. */
function setMarkers() {
    
    for (let i = 0; i < csv_data_length; i++) { // 마커 하나씩 지정해서 대입
        let position = new kakao.maps.LatLng(parseFloat(csv_data[i].latlng[0]), parseFloat(csv_data[i].latlng[1]))
        
        marker[i] = new kakao.maps.Marker({
            map: map,
            position: position,
            clickable: true
        });

        // 클릭 리스너, 다른 차트와 연동할 때 사용
        kakao.maps.event.addListener(marker[i], 'click', function () {
            selectData(i)
        });
    }
    setMarkerImage();
}

function setMarkerImage(){
    
    for (let i = 0; i < csv_data_length; i++) { // 마커 하나씩 지정해서 대입
        markercolor = (currently_radio_type === 'radio-All') ? 
            marker_blue : getColor(parseFloat(csv_data[i][currently_radio_type.split('-')[1]]));
        let markerImage = new kakao.maps.MarkerImage(markercolor, markerSize);
        marker[i].setImage(markerImage);
    }
}

/** marker[arr]에 저장된 모든 값을 지우는 함수
 * input markers[arr]
 */
function deleteMarkers(marker) {

    if (marker.length !== 0) {
        for (let i = 0; i < csv_data_length; i++) {
            marker[i].setMap(null);
        }
    }
}

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
            csv_data_length = csv_data.length;

            for (let key of Object.keys(csv_data[0])) {
                ColumnData[key] = [];
                for (let i = 0; i < csv_data_length; i++) {
                    ColumnData[key].push(csv_data[i][key])
                }
            }
            
            valueInitialize();     
        }
    });
});

/** 초기값 설정 함수 */
function valueInitialize() {
    let position = new kakao.maps.LatLng(parseFloat(csv_data[0].latlng[0]), parseFloat(csv_data[0].latlng[1]))
    map.setCenter(position);
    createIw();
    setMarkers();
    setText(parseFloat(ColumnData.dist[csv_data_length - 1]).toFixed(3) + " km", "dist");
    for (let key of ["pd", "roughness", "amount_crack", "ratio_crack", "SPI_1", "SPI_2", "SPI_3"]) {
        setText(getAvg(ColumnData[key]).toFixed(3), key)
    }
    makeChart();
    makeGrid();
}



/** 주어진 배열의 평균값을 내보내는 함수
 * input data_array[arr]
 * return avg[number]
*/
function getAvg(data_array) {

    let sum = 0;
    for (let i = 0; i < data_array.length; i++) {
        sum += parseFloat(data_array[i])
    }
    return (sum / data_array.length);
}

/** value 값을 받아들여 html ID에 text 형식으로 넘겨주는 함수
 * input value[let], id[string]
*/
function setText(value, ID) {

    document.getElementById(ID).innerText = value
}

/** Chart를 생성하는 함수 */
function makeChart() {

    let id = ['AP_L', 'AP_T', 'AP_CJ', 'AP_AC', 'AP_P', 'AP_H'];

    for (let key of id) {
        let sum = [0, 0, 0]
        for (let j = 0; j < 3; j++) {
            for (let i = 0; i < csv_data_length; i++) {
                sum[j] += parseFloat(ColumnData[key][i][j]);
            }
        }
        myChart[key] = new Chart(key + '_Chart', makeChartData(sum));
    }
}

/** Chart 생성자에 들아갈 data를 만들어 주는 함수
 * input L,M,H_data[arr]
 * return chart_data[object]
 */
function makeChartData(dataArr) {

    // key로 label 값 정해주기
    return {
        type: 'bar',
        data: {
            labels: ['L', 'M', 'H'],
            datasets: [{
                data: dataArr,
                datalabels: {
                    color: 'black',
                    font: { size: 12 },
                    offset: 3,
                    anchor: 'end',
                    clamp: true,
                    clip: false,
                    align: 'top'
                },
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { // y축 줄당 표시 값
                        stepSize: 2
                    }
                },
                x: {
                    beginAtZero: true,
                    type: 'category',
                }
            }
        }
    }
}

/** Grid를 생성하는 함수 */
function makeGrid() {

    let table = document.getElementById('cb3-table-body');
    let table_head = ["dist", "note", "w", "pd", "roughness", "amount_crack", "ratio_crack", "SPI_1", "SPI_2",
        "SPI_3", "AP_L", "AP_L", "AP_L", "AP_T", "AP_T", "AP_T", "AP_CJ", "AP_CJ", "AP_CJ", "AP_AC", "AP_AC", "AP_AC", "AP_P", "AP_P", "AP_P", "AP_H", "AP_H", "AP_H"];

    for (let i = 0; i < csv_data_length; i++) {
        let tr = document.createElement("tr");
        tr.id = 'table-row-' + i
        count = 0
        for (let head of table_head) {
            let td = document.createElement("td")
            if (head.startsWith('AP_')) {
                td.appendChild(document.createTextNode(ColumnData[head][i][count % 3] + ""));
                tr.appendChild(td)
                count++
            }
            else {
                td.appendChild(document.createTextNode(ColumnData[head][i] + ""));
                tr.appendChild(td)
            }
        }
        table.appendChild(tr);
        tr.addEventListener('click', function () {
            selectData(i)
        })
    }
}

/** 선택된 행에 맞는 이벤트를 발생하는 함수
 * input row_index[number]
 */
function selectData(selectedRow) {
    //기존 선택되었던 컬럼 선택 해제,
    //인포윈도 , 사진 변경, 해당 열 강조, 차트 값 변경

    let index = selectedRow;
    let position = new kakao.maps.LatLng(parseFloat(csv_data[index].latlng[0]), parseFloat(csv_data[index].latlng[1]))
    let status_img_src = './가산로(2103)_하_2_2/가산로(2103)_하_2_2_도로현황/D810/Camera1/0/' + csv_data[index].status_img
    let surf_img_src = './가산로(2103)_하_2_2/가산로(2103)_하_2_2_U_net-result/0/' + csv_data[index].surf_img
    let keys = ['AP_L', 'AP_T', 'AP_CJ', 'AP_AC', 'AP_P', 'AP_H'];
    deleteIw(infoWindows)
    // 선택된 행을 다시 눌렀을 때
    if (selected === index) {
        // chart 부분
        for (let key of keys) {
            for (let i = 0; i < 3; i++) {
                removeChartData(myChart[key]);
            }
            let sum = [0, 0, 0]
            label = ['L', 'M', 'H'];
            for (let i = 0; i < 3; i++) // 데이터 다시 체워넣기
            {
                for (let j = 0; j < csv_data_length; j++) {
                    sum[i] += parseFloat(ColumnData[key][j][i]);
                }
                addChartData(myChart[key], label[i], sum[i]);
            }
        }


        document.getElementById("table-row-" + index).style = "background-color : white"
        if (map.getLevel() <= 2) {
            zoomOut()
        }
        selected = -1
        return
    }
    infoWindows[index].open(map, marker[index]); // 클릭할 때 인포 윈도우 생성
    document.getElementById("status_img").src = status_img_src; // 도로 현황 이미지 변경
    document.getElementById("surf_img").src = surf_img_src; // 도로 표면 이미지 변경
    for (let i = 0; i < csv_data_length; i++) // 다른 행 강조 해제
    {
        document.getElementById("table-row-" + i).style = "background-color : white"
    }
    document.getElementById("table-row-" + index).style = "background-color : rgb(144 144 185)" // 행 강조

    // 선택시 chart 생성하는 for문
    for (let key of keys) {
        for (let i = 0; i < 3; i++) {
            removeChartData(myChart[key]);
        }
        label = ['L', 'M', 'H'];
        for (let i = 0; i < 3; i++) {
            addChartData(myChart[key], label[i], csv_data[index][key][i]);
        }
    }

    if (map.getLevel() > 2) {
        zoomIn()
    }
    map.setCenter(position) // 선택한 마커 중심으로 맵 이동
    selected = index
}

/** 만들어진 chart 안의 데이터 하나를 지우는 함수
 * input myChart[?][object]
 */
function removeChartData(chart) {

    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}

/** 만들어진 chart 안에 라벨과 데이터 하나를 넣는 함수 
 * input myChart[?][object], label[string], data[number]
*/
function addChartData(chart, label, data) {

    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}