const fs = require('fs');
const path = require('path');
const https = require('https');

// Sample N1 Kanji
const kanjiString = "哀慰詠悦閲炎怨宴縁艶翁凹殴桜恩穏佳苛暇禍靴寡箇稼蚊牙瓦雅餓塊壊怪悔懐戒拐劾涯街該概郭隔穫岳顎掛潟括喝渇葛滑褐轄且釜鎌刈甘汗缶肝冠陥乾勘患貫喚堪換敢棺款閑勧寛歓監緩憾還館環簡艦観丸含岸頑企伎忌奇祈軌既飢鬼亀幾棋棄毀畿輝騎宜偽欺儀戯擬犠菊吉喫詰却客脚虐逆丘久仇休及吸宮弓急救朽求究泣級糾給旧牛去居巨拒拠挙虚許距魚御漁凶共叫狂京享供協況峡挟狭恐胸脅強教郷境橋矯鏡競響驚仰凝暁業局曲極玉桐勤筋琴禁禽緊愚偶遇隅串屈掘窟熊繰君訓勲薫軍群兄刑圭型契形径恵慶慧憩掲携敬景渓系経継茎蛍計詣警軽鶏芸迎鯨劇撃激隙桁傑欠決潔穴結血月件健兼券剣圏堅嫌建憲懸検権犬献研絹県肩見謙賢軒遣鍵険顕験元原厳幻弦減源玄現言限乎個古呼固孤己庫弧戸故枯湖狐糊袴股胡虎誇鼓五互伍午呉吾娯後御悟碁語誤護交侯候光公功効勾厚口向后坑好孔孝宏工巧幸広康弘恒慌抗拘控攻昂晃更校梗構江洪浩港溝甲皇硬稿紅絞綱耕考肯航荒行衡講貢購郊酵鉱鋼降項香高剛号合拷豪轟骨込此頃今困墾婚恨懇昏昆根混痕紺魂些佐叉唆左差査沙砂詐鎖挫座債催再最哉塞妻宰彩才採栽歳済災采砕祭斎細菜裁載際剤在材罪財坂咲崎埼碕鷺作削搾昨朔柵索策酢錯桜冊刷察拶撮擦札殺薩雑皿三傘参山惨散桟産算蚕賛酸斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽磁示而耳自辞汐鹿式識軸七叱執失嫉室悉湿漆疾質実芝舎写射捨赦斜煮社者謝車遮蛇邪借勺尺爵酌釈錫若寂弱主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周宗就州修愁拾洲秀秋終習臭舟衆襲蹴酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊春瞬竣舜駿准循旬殉淳準潤盾純巡遵順処初所暑曙書渚庶署緒署諸助叙女序徐恕除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌星昭晶松梢樟沼消渉漿焼焦照症省硝礁祥称章笑粧紹肖衝訟証詔詳象賞鐘障鞘上丈丞乗冗城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾拭植殖燭織職色触食辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須図水吹垂帥推水炊睡粋翠衰遂酔錐錘随髄枢崇数枢趨雛据杉菅雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績責赤切拙接摂折設窃節説雪絶舌仙先千占宣専尖川戦扇撰栓泉浅洗染潜煎煽旋穿箭線繊船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳塑岨措曾楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋逮退逮隊黛鯛代台大第題滝宅択拓沢濯託濁諾茸凧蛸只叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端胆誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓邸泥摘敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都努度土奴怒倒党冬凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗湯涛灯當痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅鴇匿得徳涜特督篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入如尿韮任妊忍認濡禰寧葱猫熱年念捻燃粘乃廼与之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾潘煩盤盲蕃蛮販藩晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨巫布府怖扶敷斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆摩マ磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履理痢裏裡里離陸律率立略柳流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂恋連練聯蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠湾碗腕";

// Let's just pick a random sample of 200 unique characters to keep it manageable and realistic
const uniqueKanji = [...new Set(kanjiString.split(''))];
// Shuffle the array and pick the first 200
for (let i = uniqueKanji.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [uniqueKanji[i], uniqueKanji[j]] = [uniqueKanji[j], uniqueKanji[i]];
}
const selectedKanji = uniqueKanji.slice(0, 200);

const fetchKanjiDetails = (kanji) => {
  return new Promise((resolve) => {
    https.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log(`Generating Kanji N1 data for ${selectedKanji.length} characters...`);
  const kanjiN1 = [];
  let id = 1;

  for (let k of selectedKanji) {
    const details = await fetchKanjiDetails(k);
    if (details && !details.error) {
      kanjiN1.push({
        id: id++,
        karakter: k,
        onyomi: details.on_readings ? details.on_readings.join(', ') : '-',
        kunyomi: details.kun_readings ? details.kun_readings.join(', ') : '-',
        arti: details.meanings ? details.meanings.join(', ') : '-',
        contoh: ""
      });
      console.log(`Fetched ${k}: ${details.meanings ? details.meanings[0] : '-'}`);
    } else {
      console.log(`Failed to fetch ${k}, skipping.`);
    }
    await delay(100);
  }

  const outPath = path.join(__dirname, 'src', 'data', 'kanjiN1.json');
  fs.writeFileSync(outPath, JSON.stringify(kanjiN1, null, 2));
  console.log(`Successfully saved ${kanjiN1.length} N1 kanji to ${outPath}`);
}

run();
