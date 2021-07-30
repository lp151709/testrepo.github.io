
function search_charts_value(){
    linkTo("history", {
        day: search_day_len * -1
    }, "SearchHistoryStatistics", function (val) {
        var x_val = [], y_val = [];
        for(var k in val){
            x_val.push(k);
            y_val.push(val[k]);
        }

        var echarts_dom = document.getElementById("echarts_container");
        var myChart = echarts.init(echarts_dom);
        option = null;
        option = {
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: x_val
            },
            yAxis: {
                show:false, //不显示y轴
                type: 'value',
                splitLine:{
                    show:false//不显示网格线
                },
            },
            series: [{
                data: y_val,
                type: 'line',
                areaStyle: {
                    normal: {
                        color: '#8cd5c2' //改变区域颜色
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#8cd5c2', //改变折线点的颜色
                        lineStyle: {
                            color: '#8cd5c2' //改变折线颜色
                        }
                    }
                }
            }]
        };

        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }

    });
}

search_charts_value();