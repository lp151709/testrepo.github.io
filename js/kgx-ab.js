G6.registerNode(
  "kgnode",
  {
    afterDraw(cfg, group) {
      const size = cfg.size; //圆直径
      // 添加边框
      group.addShape("circle", {
        attrs: {
          x: 0,
          y: 0,
          r: size / 2,
          stroke: cfg.style.stroke,
          lineWidth: cfg.style.lineWidth,
        },
        // must be assigned in G6 3.3 and later versions. it can be any value you want
        name: "circle-shape",
      });
      if (cfg.dtype == 1) {
        //添加阴影
        group.addShape("circle", {
          attrs: {
            x: 0,
            y: 0,
            r: size / 2 + 3,
            stroke: cfg.style.lightStroke,
            lineWidth: 6,
          },
          // must be assigned in G6 3.3 and later versions. it can be any value you want
          name: "circle-shape2",
        });
      }
    },
  },
  "image"
);

var typedic = {
  1: "伴侣",
  2: "共事",
  3: "父母",
  4: "合作",
  5: "子女",
  6: "评价",
  7: "朋友",
  8: "影响",
  9: "同乡",
  10: "同一共同体",
  11: "共同求学",
  12: "供稿",
  13: "主编/主笔",
  14: "编辑",
  15: "创办",
  16: "撰写",
  17: "评价",
  18: "属于",
  19: "籍贯",
  20: "留学",
  21: "参与",
};

var graph = null;
var data = null;

function searchAB() {
  if (!$("#queryA").val()) {
    $.Toast("系统提示", "请输入人物A！", "error", {
      position_class: "toast-top-right",
    });
    $("#queryA").focus();
  } else {
    if (!$("#queryB").val()) {
      $.Toast("系统提示", "请输入人物B！", "error", {
        position_class: "toast-top-right",
      });
      $("#queryB").focus();
    } else {
      //检索
      console.log("queryAB");
      $.ajax({
        url: "/es/jdbk/relations/QuerySNS",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
          queryA: $("#queryA").val(),
          queryB: $("#queryB").val(),
          types: [],
        }),
        success: function (r) {
          data = {};
          //节点
          data.nodes = r.nodes.map(function (node, i) {
            var nn = {
              id: node.uri,
              type: "kgnode",
              label: node.name,
              dtype: node.type,
            };
            switch (node.type) {
              case 1:
                nn.img = "/uc/img/2.png";
                nn.style = {
                  stroke: "#2c61c7",
                  lightStroke: "",
                  lineWidth: 2,
                };
                nn.size = 64;
                nn.clipCfg = {
                  show: true,
                  type: "circle",
                  r: 32,
                };
                break;
              case 2:
                nn.img = "/uc/img/3.png";
                nn.style = {
                  stroke: "#27c2aa",
                  lineWidth: 2,
                };
                nn.size = 64;
                nn.clipCfg = {
                  show: true,
                  type: "circle",
                  r: 32,
                };
                break;
              case 3:
                nn.img = "/uc/img/4.png";
                nn.style = {
                  stroke: "#e89b30",
                  lineWidth: 2,
                };
                nn.size = 64;
                nn.clipCfg = {
                  show: true,
                  type: "circle",
                  r: 32,
                };
                break;
              case 4:
                nn.img = "/uc/img/5.png";
                nn.style = {
                  stroke: "#ca4e70",
                  lineWidth: 2,
                };
                nn.size = 64;
                nn.clipCfg = {
                  show: true,
                  type: "circle",
                  r: 32,
                };
                break;
              case 5:
                nn.size = 86;
                nn.img = "/uc/img/org.png";
                nn.style = {
                  stroke: "#03a9e2",
                  lineWidth: 2,
                };
                nn.clipCfg = {
                  show: true,
                  type: "circle",
                  r: 43,
                };
                break;
            }

            if (nn.label == "张恨水") {
              nn.img = "/uc/img/entity/张恨水.jpg";
            }

            return nn;
          });
          //边
          data.edges = r.relations.map(function (edge, i) {
            return {
              source: edge.subject,
              target: edge.object,
              type: "line",
              label: edge.predict,
            };
          });
          graph.data(data);
          graph.render();
        },
      });
    }
  }
}

$(function () {
  $("#queryA").on("keypress", function (e) {
    if (e.which == 13) {
      if ($("#queryA").val()) {
        if (!$("#queryB").val()) {
          $("#queryB").focus();
        } else {
          searchAB();
        }
      }
    }
  });

  $("#queryB").on("keypress", function (e) {
    if (e.which == 13) {
      if ($("#queryB").val()) {
        if (!$("#queryA").val()) {
          $("#queryA").focus();
        } else {
          searchAB();
        }
      }
    }
  });

  const tc = document.createElement("div");
  tc.id = "toolbarContainer";
  document.body.appendChild(tc);
  const toolbar = new G6.ToolBar();

  graph = new G6.Graph({
    plugins: [toolbar],
    container: "xcontainer",
    width: $("#xcontainer").width(),
    height: $("#xcontainer").height(),
    // fitView: true,
    // fitViewPadding: [20, 40, 50, 20],
    defaultEdge: {
      type: "quadratic",
      endArrow: true,
      color: "#8facbb",
      lineWidth: 12,
      labelCfg: {
        style: {
          fontSize: 12,
          fill: "#8facbb",
          background: {
            fill: "#ffffff",
            stroke: "#ffffff",
            padding: [5, 5, 5, 5],
            radius: 2,
          },
        },
      },
      style: {
        endArrow: {
          path: G6.Arrow.vee(8, 10, 10),
          d: 15,
          fill: "#8facbb",
          stroke: "#8facbb",
        },
      },
    },
    defaultNode: {
      labelCfg: {
        position: "bottom",
        offset: 5,
        style: {
          fontSize: 12,
          fontWeight: 1000,
          fill: "#555",
        },
      },
    },
    layout: {
      type: "force",
      linkDistance: 300,
      preventOverlap: true,
      nodeSpacing: 20,
    },
    modes: {
      default: [
        {
          type: "drag-node",
        },
        {
          type: "zoom-canvas",
        },
        {
          type: "activate-relations",
        },
        // {
        //   type: "tooltip",
        //   formatText(model) {
        //     return "姓名：" + model.label + "<br/>uri：" + model.id;
        //   },
        //   offset: 15,
        // },
        {
          type: "edge-tooltip",
          formatText(model) {
            return model.label;
          },
          offset: 15,
        },
        {
          type: "brush-select",
        },
      ],
    },
    nodeStateStyles: {
      hover: {
        lineWidth: 3,
        stroke: "#2c61c7",
        lightStroke: "#d0e8ff",
      },
      click: {
        stroke: "#000",
        lineWidth: 2,
      },
    },
    edgeStateStyles: {
      click: {
        stroke: "#000",
        lineWidth: 2,
      },
    },
  });

  graph.on("node:mouseenter", (e) => {
    const nodeItem = e.item;
    graph.setItemState(nodeItem, "hover", true);
  });
  graph.on("node:mouseleave", (e) => {
    const nodeItem = e.item;
    graph.setItemState(nodeItem, "hover", false);
  });
  graph.on("node:click", (e) => {
    const clickNodes = graph.findAllByState("node", "click");
    clickNodes.forEach((cn) => {
      graph.setItemState(cn, "click", false);
    });
    const nodeItem = e.item;
    var model = e.item.getModel();
    if (model.dtype == 1) {
      $.ajax({
        url: "/es/mrPerson/multsearch",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({
          freetext: model.label,
          pager: { pageth: 1 },
        }),
        success: function (r) {
          var person = r.persons[0];
          var bind_Val = {
            name: person.name,
            beYear: person.birthday + " - " + person.deathday,
            place: person.place,
            description: person.firstBrief,
            img: person.personImgUri,
          };
          bind_Val.descriptionLong = longString(bind_Val.description, 40);
          $("#relation_info_div").DataBind(bind_Val);
        },
      });
    }
    // console.log("click");
    // if(e.item.getModel().dtype==1){
    //   graph.updateItem(nodeItem, {
    //     // 节点的样式
    //     style: {
    //       stroke: "#2c61c7",
    //       lightStroke: "#afc2e6",
    //     },
    //   });
    // }
    graph.setItemState(nodeItem, "click", true);
  });
});
