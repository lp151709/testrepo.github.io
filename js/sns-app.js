// 颜色设置
// 人物：    2d64cd
// 地点：    28c8af
// 文献：    f0a032
// 事件：    d15174
// 共同体：  03a9e2

var colors = {
  "person": ["#2d64cd", "#bdceef", "#d7e2f6", "#cad8f2"],
  "location": ["#28c8af", "#bceee6", "#d7f5f0", "#d7f5f0"],
  "literature": ["#f0a032", "#fae1bf", "#fcedd8", "#fcedd8"],
  "event": ["#d15174", "#f1c8d3", "#f6dee5", "#f6dee5"],
  "org": ["#03a9e2", "#b0e4f6", "#d0effa", "#d0effa"]
};

var literatures = [
  "中原豪侠传", "亡国奴之日记一卷", "京尘幻影录", "人海梦", "众生相", "啼笑因緣", "回春之曲", "夜来香", "夜深沉", "太平花", "巴山夜雨", "春明外史", "春明新史", "水浒新传", "燕归来", "王公馆", "现代青年", "礼拜六的晚上", "秋江", "秋海棠", "纸醉金迷", "艺术之宫", "赵钱孙李", "迷魂游地府记", "金粉世家", "铁血情丝", "锦片前程", "风雪之夜", "魍魉世界",];

var persons = [
  "严宝礼", "严独鹤", "严谔声", "于右任", "余大雄", "俞平伯", "刘半农", "包天笑", "史量才", "叶楚伧", "吕志伊", "吴中一", "周作人", "周瘦鹃", "孙伏园", "孙玉声", "宋教仁", "张东荪", "张丹斧", "张友鸾", "张君劢", "张季鸾", "张恨水", "张謇", "徐枕亚", "恽逸群", "成舍我", "戴天仇", "戴季陶", "景耀月", "曾广铨", "李子宽", "李浩然", "李涵秋", "林语堂", "柳亚子", "梁遇春", "毕倚虹", "江绍原", "汪康年", "沈玄庐", "潘公展", "狄楚青", "王季同", "王芸生", "秦瘦鸥", "程小青", "章士钊", "章川岛", "章炳麟", "罗普", "范光启", "范烟桥", "范鸿仙", "萧同兹", "萨空了", "蔡乃煌", "蔡元培", "蔡尔康", "袁寒云", "褚保衡", "许啸天", "谢六逸", "邵力子", "郑逸梅", "钱玄同", "陈冷", "陈布雷", "陈景韩", "陈训悆", "雷奋", "顾颉刚", "马叙伦", "马荫良", "鲁迅"
];

var typedic = [
  "伴侣", "共事", "父母", "合作", "子女", "朋友", "同乡", "同一共同体", "共同求学", "供稿", "主编/主笔", "编辑", "创办", "撰写", "评价", "属于", "籍贯", "留学", "参与", "其他责任者", "其他"];



var places = [];
var events = [];
var orgs = [];

// nodeGenerate(node,persons,"#2d64cd","https://dhc.library.sh.cn/uc/img/svg/user.svg","https://dhc.library.sh.cn/uc/img/entity/person/")

function nodeGenerate(node, arr, colors, svg, imgPrefix) {
  let size = 64 + node.count * 4;

  if (size > 100) size = 100;

  return typeof node.introduction != "undefined" &&
    typeof node.introduction.imgUrl != "undefined" ? {
      id: node.uri,
      type: "kgnode",
      label: node.name,
      dtype: node.type,
      dlink:
        typeof node.introduction != "undefined" &&
          typeof node.introduction.link != "undefined"
          ? node.introduction.link
          : "",
      img: node.introduction.imgUrl.replace('https://img.library.sh.cn/person/', '/resource/person/'),
      style: {
        stroke: colors[0],
        lightStroke: "",
        fill: colors[1],
        lineWidth: 2,
      },
      size: size,
      clipCfg: {
        show: true,
        type: "circle",
        r: size / 2,
      },
      stateStyles: {
        click: {
          lightStroke: colors[3],
        },
        active: {
          lineWidth: 4,
          fill: colors[2],
        },
      },
    }
    : {
      id: node.uri,
      type: "circle",
      label: node.name,
      dtype: node.type,
      ddate: node.date,
      ddata: node.description,
      dlink:
        typeof node.introduction != "undefined" &&
          typeof node.introduction.link != "undefined"
          ? node.introduction.link
          : "",
      style: {
        stroke: colors[0],
        lightStroke: "",
        fill: colors[1],
        lineWidth: 2,
      },
      size: size,
      icon: {
        show: true,
        width: (size * 2) / 3,
        height: (size * 2) / 3,
        img: svg,
      },
      stateStyles: {
        click: {
          lineWidth: 4,
          fill: colors[3],
        },
        active: {
          lineWidth: 4,
          fill: colors[3],
        },
      },
    };
}

var graph = null;

function filter() {
  var select_val = $("#loves_select_content").GetData();
  var keys = [];
  for (var k in select_val.edits) {
    keys.push(select_val.edits[k]);
  }
  for (var k in select_val.persons) {
    keys.push(select_val.persons[k]);
  }
  graph.filter(keys);
}

//获取url参数
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); //匹配目标参数
  if (r != null) return unescape(r[2]);
  return null; //返回参数值
}

$(function () {
  graph = new KGraph("xcontainer");
  let queryPerson = function (model) {
    if (model.dtype == 1) {
      //绑定数据请求
      $.ajax({
        url: "/es/mrPerson?uri=" + model.id,
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        success: function (r) {
          if (r.errorCode === "0") {
            var person = r.data;
            var bind_Val = {
              name: person.name,
              beYear:
                typeof person.birthday !== "undefined"
                  ? person.birthday +
                  (typeof person.deathday !== "undefined"
                    ? " ~ " + person.deathday
                    : " ~ ")
                  : "",
              place: person.place,
              description: person.firstBrief,
              ethnicity: person.ethnicity,
              gender: person.gender,
              img:
                persons.indexOf(person.name) != -1
                  ? "/uc/img/entity/person/" +
                  person.name +
                  ".jpg"
                  : person.personImgUri,
              link: model.id,
            };
            if (bind_Val.description) {
              bind_Val.descriptionLong = longString(bind_Val.description, 40).replace("<p>", "").replace("</p>", "");
            }
            $("#relation_info_div").DataBind(bind_Val);
            $("#relation_info_div_org").hide();
            $("#relation_info_div_event").hide();
            $("#relation_info_div_article").hide();
            $("#relation_info_div").show();
          }
        },
      });
    } else if (model.dtype == 3) {
      var result = $.parseJSON(
        $.ajax({
          url: "/es/jdbk/newspaper?uri=" + model.id,
          async: false,
        }).responseText
      );
      if (result.errorCode === "0") {
        var article = result.datas;
        var ceditors = $.grep(article.chiefEditorUri, function (d, n) {
          return d.role === "主编";
        });
        var bind_Val = {
          name: article.titleChs,
          beYear: article.created,
          description: article.description,
          editors:
            ceditors.length > 0
              ? $.map(ceditors[0].person, function (d, n) {
                return d.nameChs;
              }).toString()
              : "",
          category: article.category,
          publisher: article.publisher.name,
          link: model.id,
        };
        if (bind_Val.description) {
          bind_Val.descriptionLong = longString(bind_Val.description, 80).replace("<p>", "").replace("</p>", "");
        }
        $("#relation_info_div_article").DataBind(bind_Val);
        $("#relation_info_div").hide();
        $("#relation_info_div_org").hide();
        $("#relation_info_div_article").show();
        $("#relation_info_div_event").hide();
      }
    } else if (model.dtype == 4) {
      if (!_.isUndefined(model.ddate)) {
        var bind_Val = {
          name: model.label,
          beYear: model.ddate,
          description: model.ddata
        };
        if (bind_Val.description) {
          bind_Val.descriptionLong = longString(bind_Val.description, 400).replace("<p>", "").replace("</p>", "");
        }
        $("#relation_info_div_event").DataBind(bind_Val);
        $("#relation_info_div").hide();
        $("#relation_info_div_org").hide();
        $("#relation_info_div_article").hide();
        $("#relation_info_div_event").show();
      }
    } else if (model.dtype == 5) {
      $.ajax({
        url:
          "/es/jdbk/relations/community?uri=" +
          model.id,
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        success: function (r) {
          if (r.code === 0) {
            var org = r.data;
            var bind_Val = {
              name: org.title,
              beYear: org.startedTime,
              place: org.startedPlace,
              description: org.description,
              type: org.type,
              mainPerson: org.mainPerson,
              link: model.id,
            };
            if (bind_Val.description) {
              bind_Val.descriptionLong = longString(bind_Val.description, 80).replace("<p>", "").replace("</p>", "");
            }
            $("#relation_info_div_org").DataBind(bind_Val);
            $("#relation_info_div").hide();
            $("#relation_info_div_article").hide();
            $("#relation_info_div_event").hide();
            $("#relation_info_div_org").show();
          }
        },
      });
    }
  };

  graph.nodeClick(queryPerson);

  graph.nodeDoubleClick(function (model) {
    queryPerson(model);
    searchRelation(model.label, true);
  });

  var searchAB = function () {
    if (!$("#query1").val()) {
      // $.toast("系统提示", "请输入人物A！", "error", {
      //   position_class: "toast-top-right",
      // });
      $("#query1").focus();
    } else {
      if (!$("#query2").val()) {
        // $.toast("系统提示", "请输入人物B！", "error", {
        //   position_class: "toast-top-right",
        // });
        $("#query2").focus();
      } else {
        //检索
        console.log("queryAB");
        var qa = $("#query1").val();
        var qb = $("#query2").val();
        $.ajax({
          url: "/es/jdbk/relations/QuerySNS",
          type: "POST",
          dataType: "json",
          contentType: "application/json",
          data: JSON.stringify({
            queryA: qa,
            queryB: qb,
            types: [],
          }),
          success: function (r) {
            var data = loadData(r, false);

            var clickNodes = $.grep(data.nodes, function (node, i) {
              return node.label.indexOf(qa) != -1 || node.id == qa
                ||
                node.label.indexOf(qb) != -1 || node.id == qb;
            });
            if (clickNodes.length > 0) {
              graph
                .getGraph()
                .setItemState(
                  graph.getGraph().findById(clickNodes[0].id),
                  "click",
                  true
                );              
              queryPerson(clickNodes[0]);
            }
          }
        });
      }
    }
  };

  var loadData = function (r, appended, combo) {
    data = {};
    //边, 加载
    data.edges = [];

    for (var ei in r.relations) {
      let edge = r.relations[ei];

      var type = _.find(typedic, function (x) { return x == edge.predict });

      if (_.isUndefined(type)) {  //找不到对应类型的情况，需要映射到已有的类型
        var onode = _.findWhere(r.nodes, { uri: edge.object });
        if (onode.type === 3) { //文献的话，统一到其他责任者
          edge.predict = "其他责任者";
        } else if (onode.type === 1) {
          edge.predict = "其他";
        }
      }

      if(edge.subject==null || edge.object==null)
        continue;

      let ne = {
        source: edge.subject,
        target: edge.object,
        type: "line",
        label: edge.predict,
      };

      if (
        [
          "同乡",
          "伴侣",
          "同一共同体",
          "朋友",
          "共事",
          "合作",
          "共同求学",
        ].indexOf(edge.predict) != -1
      ) {
        //ne.startArrow = true;
        ne.style = {
          endArrow: {
            path: G6.Arrow.vee(8, 10, 10),
            d: 15,
            fill: "#8facbb",
            stroke: "#8facbb",
          },
          startArrow: {
            path: G6.Arrow.vee(8, 10, 10),
            d: 15,
            fill: "#8facbb",
            stroke: "#8facbb",
          },
        };
        var find = false;
        for (var edi in data.edges) {
          let ed = data.edges[edi];
          if (
            (ed.source == ne.source &&
              ed.target == ne.target &&
              ed.label == ne.label) ||
            (ed.source == ne.target &&
              ed.target == ne.source &&
              ed.label == ne.label)
          ) {
            find = true;
            console.log("find");
            break;
          }
        }
        if (find) continue;
      }
      data.edges.push(ne);
    }


    var rels = _.uniq(_.map(data.edges, function (e) { return e.label }));
    console.log(rels);
    if (!appended) {
      $("#loves_select_content label").hide();
    }
    _.each(rels, function (r) {
      var ele = $("#loves_select_content input[value='" + r + "']");
      var id = $(ele).attr("id");
      $("#loves_select_content label[for='" + id + "']").show();
    });

    ///点的边数
    let nec = new Array();
    $.each(r.nodes, function (i, node) {
      nec[node.uri] = node;
      node.count = 0;
    });
    $.each(data.edges, function (i, edge) {
      nec[edge.source].count++;
      nec[edge.target].count++;
    });

    //节点
    data.nodes = r.nodes.map(function (node, i) {
      switch (node.type) {
        case 1: //人物
          return nodeGenerate(
            node,
            persons,
            colors["person"],
            "/uc/img/svg/user.svg",
            "/uc/img/entity/person/"
          );
        case 2:
          return nodeGenerate(
            node,
            places,
            colors["location"],
            "/uc/img/svg/place.svg",
            "/uc/img/entity/place/"
          );

        case 3:
          return nodeGenerate(
            node,
            literatures,
            colors["literature"],
            "/uc/img/svg/book.svg",
            "/uc/img/entity/literature/"
          );
        case 4:
          return nodeGenerate(
            node,
            events,
            colors["event"],
            "/uc/img/svg/event.svg",
            "/uc/img/entity/event/"
          );
        case 5:
          return nodeGenerate(
            node,
            orgs,
            colors["org"],
            "/uc/img/svg/org.svg",
            "/uc/img/entity/org/"
          );
      }
    });
    if (combo) {
      var orgs = _.where(data.nodes, { dtype: 5 });
      data.combos = [];
      _.each(orgs, function (node) {
        var cid = "c" + node.id;
        data.combos.push({
          id: cid,
          label: node.label
        });
        node.comboId = cid;
        _.each(_.where(data.edges, { target: node.id }), function (e) {
          var xn = _.findWhere(data.nodes, { id: e.source });
          xn.comboId = cid;
        });
      });
    }
    graph.show(data, appended);
    return data;
  }

  var searchRelation = function (query, appended) {

    var range = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    //var range = [];
    if (query === "") {
      range = [1, 16];  //人+共同体
    }
    var xurl = "/es/jdbk/relations/QueryKG";
    if (window.location.href.indexOf("from=bk") == -1) {  //非报纸    
      xurl = "/es/dhc/relation/QueryKG";
    }

    $.ajax({
      url: xurl,
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        query: query,
        range: range,
      }),
      success: function (r) {
        //空检，增加combo支持
        if (query == "严独鹤") {  //补充时间
          var xnodes = [];
          xnodes.push({
            name: "大新画厅举办海上名人书画展",
            type: 4,
            date: "1940年5月8日",
            description: "大新画厅举办海上名人书画展，展出钱云鹤、顾道明、严独鹤、周瘦鹃、郑逸梅、吴野洲等人作品。",
            uri: "http://data.library.sh.cn/authority/event/0h55e1b7tz7p1ugm"
          });
          xnodes.push({
            name: "全国美术家捐助东北抗日义勇军作品展览会理事会在中社举办",
            type: 4,
            date: "1932年12月3日",
            description: "全国美术家捐助东北抗日义勇军作品展览会理事会在中社举办，由俞寰澄主持，出席者有汪亚尘、俞寄凡、钱厓(瘦铁)、孙雪泥等。会议决定：在全国范围征集作品，并组织展览特刊编辑组，聘汪英宾、朱应鹏、周瘦鹃、严独鹤、张聿光、谢承平、徐蔚南、陈小蝶、邵洵美等任编辑。",
            uri: "http://data.library.sh.cn/authority/event/gcvy4f3gdxwaoyrd"
          });
          xnodes.push({
            name: "上海新闻记者公会成立",
            type: 4,
            date: "1932年6月25日",
            description: "1932年6月25日，上海新闻记者公会成立，是由记者联欢会与记者联合会合并而成。成立大会与会者130余人，推严谔声、何西亚、赵君豪等5人组成主席团，严谔声为主席。通过了会章，选举严谔声、马崇淦、何西亚、金雄白、赵君豪、杭石君、金华亭等15人为执行委员；推严独鹤、胡朴安、李浩然、郭步陶、周瘦鹃、顾执中、管际安等9人为监察委员。7月1日，记者公会全体执监委员举行宣誓就职，并通过了《上海新闻记者公会宣言》，称“上海新闻记者之有团体组织，实滥觞於十余年，此十余年中名称虽屡有变更，而团体未或中断，新闻记者联欢会与新闻记者联合会”改组联合组成本会。本会之任务“一方面，在交换知识，以促进新闻事业之发展；一方面，在以敬业乐群，自相策勉，对于名利之诱惑，则避之若倪，对于势力之压迫，环境之逼迫，则努力奋斗。苟及身而见我国新闻事业，得与欧美各国并驾齐驱，虽毕生辛苦，固犹视为殊荣也”。该会创办了《记者周刊》。作为会员沟通交流的园地。该会活动到1937年“八一三”抗战失败后。",
            uri: "http://data.library.sh.cn/authority/event/hm8qet6yojo17o0m"
          });
          xnodes.push({
            name: "上海记者联合会成立",
            type: 4,
            date: "1927年4月29日",
            description: "1927年4月29日，上海记者联合会成立。出席成立大会的报纸、通讯社记者共59人，推严慎予、何西亚、时振远为主席团成员。会议讨论通过了会章，审议通过了议案。选举严慎予、蒋剑候、陈冰伯、张振远、何西亚、潘竞民、叶如音、顾执中、管际安、胡仲持、周孝庵、杭石君等为执行委员，选举范敬五、康通一、严独鹤、张君璞、严谔声、金华亭、汤德铭等人为监察委员。5月3日召开第一次执行委员会议．推选顾执中为主席，张静庐、张振远为庶务部干事，李子宽、何西亚、刘云舫为文书。",
            uri: "http://data.library.sh.cn/authority/event/hop44ovmi7vtf043"
          });
          xnodes.push({
            name: "中华电影学校成立",
            type: 4,
            date: "1924年秋",
            description: "中华电影学校成立，校址设在爱多亚路(今延安东路)652号(云南路东)。该校由上海大戏院经理曾焕堂创办，顾肯夫主持。修学期限为半年。陆澹安任教务主任。教师有陈寿荫、洪深(教表演)、陆澹安(教编剧)、严独鹤、汪煦昌(教摄影)、徐琥、卜万苍、沈宝琦、顾肯夫等。招收学生的年龄、学历、职业、出身不作限制。学校以发掘人才、培养人才、提高电影演员素质为宗旨。学生只缴少量学费，每晚7至10时上课。平时督促甚严。不得无故缺课，如缺席3次，便勒令退学。课程设有：影剧概论、电影原理、电影行政、西洋近代戏剧史、电影摄影术、摄影场常识、导演术、编剧常识、化妆术，还有舞蹈及歌唱训练等。每周在曾焕堂开设的上海大戏院免费观摩外国影片两次。全部课程计360小时。亦有不少学生是业余来校进修的。在毕业的学生中，著名的人物有胡蝶、徐琴芳、汤杰、萧英、朱飞、林雪怀、赵静霞、孙敏、高梨痕、陈一棠、周空空、汤笔花等。中华电影学校只开办一届(9个月)，便因人事、经济等诸种原因而告结束。",
            uri: "http://data.library.sh.cn/authority/event/03s4pivwg8o27drc"
          });
          xnodes.push({
            name: "《礼拜六》周刊创刊于上海",
            type: 4,
            date: "1914年6月",
            description: "1914年6月6日，《礼拜六》周刊创刊于上海，中华图书馆发行，初署王钝根编辑，19期以后，署钝根、剑秋编辑。剑秋即孙剑秋。至1916年4月29日出至百期后暂停出版。这100期，被称为《礼拜六》前百期。中断五年后，1921年3月19日复刊，出至1923年2月10日第200期时终刊，仍由中华图书馆发行。编辑者署瘦鹃，理事编辑署钝根。复刊后的《礼拜六》，版权页上虽然一直署着“编辑者瘦鹃”的字样，其实只有前三十几期是由钝根和瘦鹃合作编辑，余下皆由王钝根一人独编。这100期，被称为《礼拜六》后百期。《礼拜六》是模仿美国富兰克林的《礼拜六晚邮报》而创刊的。《礼拜六》在每个星期六出版，追求的是休闲性和都市性。给读者提供的是闲暇之日享受闲暇之情的精神食粮。其文字轻松幽默，充满睿智。主要作者有王钝根、周瘦鹃、陈蝶仙、吴双热、吴绮缘、陈小蝶、程瞻庐、叶萧风、严独鹤等等，均为当时著名的才子，所以《礼拜六》具有很浓厚的才子风格。是当时发表言情小说最多的刊物，如姜杏痴的《剑胆箫心》、梅郎的《双妒花》、陈小蝶的《香草美人》、吴双热的《蘸着些儿麻上来》等。《礼拜六》言情小说创作中写得最多的无疑是周瘦鹃，周瘦鹃的短篇言情小说几乎每期都有。1915年5月9 日日本和德国在青岛开战，《礼拜六》将同时出版的第51期定为“国耻辱”专号。从这一期开始王钝根连载他根据报刊材料纂述的《国耻录》，以唤起民众的觉醒。《礼拜六》前50期主要是刊登小说，50期后涉及面渐渐广泛起来，到了后100期成为一个综合性的文学杂志。小说、笔记、译著、译丛、隽语、琐闻、笑话、杂谈等花样繁多，文章均短小，却很有趣，显示出作者的智慧和幽默。前百期小说文言较多，语言华丽，充满着才子气息。",
            uri: "http://data.library.sh.cn/authority/event/25io2bn08v6y7d2t"
          });
          xnodes.push({
            name: "《小说月刊》创刊",
            type: 4,
            date: "1940年10月",
            description: "《小说月刊》创刊。32开本。月刊。联华广告公司出版部发行。发行人陆守伦。主编顾冷观。名誉顾问严独鹤。注重长短篇小说，兼涉笔记、散文、译作、报告文学等。不少作品反映都市生活下各阶层人士生活现状和心态，曲折地表达反抗日本侵略的爱国思想，文字健康明朗。其开展的学生文艺奖金活动，吸引了众多投稿者。其撰稿人既有包天笑、周瘦鹃、程小青、张恨水、秦瘦鸥、郑逸梅等名家，又有周楞枷、文宗山、钱今昔、徐开垒等文学新人。约1944年11月停刊，共出45期，系上海“孤岛”和“沦陷时期”出版时间较长的文学期刊之一。",
            uri: "http://data.library.sh.cn/authority/event/ohk8co743qmoscr5"
          });
          xnodes.push({
            name: "世界书局成立于上海",
            type: 4,
            date: "	1917年",
            description: "1917年，世界书局成立于上海，创办人沈知方。1921年，沈知方得友人之助，筹得股金2.5万元，将世界书局从独资企业改组为股份有限公司。社址设于福州路山东路西首怀远里，并在怀远里口租下一门面作为发行所。特将发行所房屋漆成夸张的红色。对外以“红屋”称名。并很快跃居为全国第三大书局。前十年的世界书局由沈知方总揽全局，以出版小说为主。从1924年起，编辑出版中小学教科书，与商务印书馆、中华书局出版的教科书三足鼎立。到1934年前后，沈因投资失利等原因，资金周转不灵，后引入李石曾的世界社资本，才渡过难关，总经理一职改由陆高谊接任。陆高谊掌管世界书局从1934年8月到1945年9月，正处全民抗战，期间，陆高谊带领的世界书局，拒不与日伪合作，1938年8月，曾在福州路的发行所便发生了定时炸弹爆炸事件，造成职员一死一伤。即便如此，世界书局依然坚持出书。据统计，陆高谊期间的世界书局总共出书2095种。抗战胜利后，世界社李石曾为出版《世界学典》。于1946年到上海，开始接收世界书局，并扩充股额，招收新股，改选董、监事，推选杜月笙为董事长，李石曾为常务董事代理董事长和总经理职务．杨家骆为常务董事，李清悚为监事，李鸿球为副总经理，实际总管书局经营。李石曾任总经理的四年间，书局出书不多，总计才292种。上海解放后，成立临时管理委员会，1949年8月6日世界书局因涉及官僚资本，由上海市人民政府军管。1950年2月开始办理结束事宜。世界书局是股份制的商业企业组织，集编印发于一身，但相比其他书局比较商业化，增设信托部及读书储蓄部，20世纪30年代初，又成立了专为书局融资的世界商业储蓄银行，后成立专门的房地产部。就出版物整体内容而言。世界书局也比商务、中华要显得商业化，世界书局的出版物选题，十分注意走大众化道路。20世纪20年代初、中期，出版了鸳鸯蝴蝶派等一些影响面大、行销范围广的通俗性畅销书。另外，世界书局在出书的同时又出版相关杂志，如：李涵秋和张云石主编的《快活》、严独鹤和施济群主编的《红杂志》、严独鹤和赵苕狂主编的《红玫瑰》、江红蕉主编的《家庭杂志》、施济群和程小青主编的《侦探世界》。五四运动之后，世界书局出版了许多文白对照的作文、尺牍等书。供人学习模仿，受到学生界的极大欢迎。1924年至1927年大革命期间，世界书局在广州等地搜集《全民政治问答》、《农民协会问答》、《三民主义浅说》等革命宣传小册子，分批寄到上海编辑加工，然后以广州世界书局、广州共和书局等名义出版发行。20世纪20年代末，世界书局特约徐蔚南主编《ABC丛书》，前后共150余种，于1928年6月陆续出版。这套丛书早于商务印书馆的《万有文库》一年时间出版，以其学科范围综合、内容通俗浅显、作者阵容强大、适合读者需要，而获得巨大商业成功。世界书局存在的29年时间里一共出书5580种。",
            uri: "http://data.library.sh.cn/authority/event/zcc0urp3uj0cwbww"
          });

          _.each(xnodes, function (n) {
            r.nodes.push(n);
            r.relations.push({
              object: n.uri,
              predict: "参与",
              subject: "http://data.library.sh.cn/entity/person/nsu7c4ktjnyibgdw",
              type: 0
            });
          });
        }
        
        if(r.nodes.length < 1){
          alert('暂无此人关系数据！');
          return false;
        }
        var data = loadData(r, appended, query === "");

        if (query != null && query != "" && !appended) {
          var clickNodes = $.grep(data.nodes, function (node, i) {
            return node.label == query || node.id == query;
          });
          if (clickNodes.length == 0) {
            clickNodes = $.grep(data.nodes, function (node, i) {
              return node.label.indexOf(query) != -1 || node.id == query;
            });
          }
          if (clickNodes.length > 0) {
            graph
              .getGraph()
              .setItemState(
                graph.getGraph().findById(clickNodes[0].id),
                "click",
                true
              );
            graph.clickNode=clickNodes[0];
            queryPerson(clickNodes[0]);
          }
        }
      },
    });
  };

  $("#searchBtn").click(function () {
    if (window.location.href.indexOf("relation-ab") != -1) {
      console.log("click");
      searchAB();
    }
    else {
      searchRelation($("#query1").val(), false);
    }
  });

  $("#query1").on("keypress", function (e) {
    if (e.which == 13) {
      if (window.location.href.indexOf("relation-ab") != -1) {
        searchAB();
      }
      else {
        searchRelation($("#query1").val(), false);
      }
    }
  });

  $(".hot_srh").click(function () {
    $("#query1").val($(this).text());
    searchRelation($("#query1").val(), false);
  });

  $(document).on("click", "#loves_select_content input", filter);
  if (document.URL.indexOf("relation-ab") == -1) {
    $("#query2").hide();
    $("#query1").attr("placeholder", "检索内容");
    $("#querymid").hide();
    $(".g6-component-toolbar").width("750px");
  }

  $("#xselect").change(function () {
    changeLayer();
  });

  $("#changeLayout").click(function () {
    changeLayer();
  });
  if (window.location.href.indexOf("relation-ab") == -1) {
    //传递的uri参数
    var uri = getUrlParam("uri");
    if (uri != null) {
      searchRelation(uri, false);
    }
  }
  if (window.location.href.indexOf("from=bk") == -1) {  //非报纸    
    $("li[code='abpath']").remove();
    $(".g6-component-toolbar").width("665px");
  }
});
