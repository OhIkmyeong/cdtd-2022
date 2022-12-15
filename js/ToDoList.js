import { return_date_string } from "./FN.js";

/** 📌TO DO LIST 관련 */
export class ToDoList {
    /** TO DO LIST 관련 */
    constructor(){
        this.$icToday = document.getElementById('ic-today');

        this.$year = document.getElementById('td-date-year');
        this.$month = document.getElementById('td-date-month');
        this.$date = document.getElementById('td-date-date');
        this.$day = document.getElementById('td-date-day');

        this.$countText = document.getElementById('td-count-text');
        this.$countBar = document.getElementById('td-count-graph-bar');
        this.$countNum = document.getElementById('td-count-graph-num');

        this.$tdList = document.getElementById('td-list');

        this.$form = document.getElementById('form-add-td');
        this.$formIpt = document.getElementById('ipt-add-td');
        this.$formBtn = document.getElementById('btn-add-td');

        this.today = null;
        this.currDate = null;
        this.days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
        this.data = null;

        this.CAL = null;
    }//constructor

    /** 
     * 최초 화면 로드시  
     * @param {Class}CAL 캘린더 클래스 받아오기
    */
    async init(CAL){
        //캘린더 클래스 받아오기
        this.CAL = CAL;

        //데이터 설정
        this.data = await fetch('./json/data.json').then(res=>res.json()).then(json=>json.todo);
        
        //오늘 날짜 설정
        this.today = return_date_string(new Date());

        //화면 변경 총괄
        this.display_all(this.today);

        //form에 이벤트 추가
        this.$form.addEventListener('submit',(e)=>{
            //등록시
            this.on_submit(e);
            
            //카운트 수정
            this.display_count();

            //캘린더에 표시 수정
            this.CAL.change_rmn_done(this.currDate);
        });

        //to do list에 이벤트 추가(삭제 가능하도록);
        this.$tdList.addEventListener('click',(e)=>{
            switch(e.target.tagName){
                case "BUTTON" : {
                    /* 삭제버튼 */
                    //아이템 지우고 데이터에서도 삭제
                    this.delete_td_item(e.target);

                    //카운트 수정
                    this.display_count();

                    //캘린더에 표시 수정
                    this.CAL.change_rmn_done(this.currDate);
                }break;
                
                case "INPUT" : {
                    /* 체크박스 */
                    //데이터에서 수정
                    this.modify_data(e.target);

                    //카운트 수정
                    this.display_count();

                    //캘린더에 표시 수정
                    this.CAL.change_rmn_done(this.currDate);
                }break;
            }//switch
        });
    }//init

    /**
     * 화면 바꾸기 총괄
     * @param {String}dateString yyyy-mm-dd
     */
    display_all(dateString){
        //현재 보여줄 날짜 변경
        this.change_curr_date(dateString);
                
        //날짜 표시 변경
        this.display_date_info(dateString);

        //오늘 아이콘 표시
        this.is_today(dateString);

        //오늘의 할 일 목록 표시
        this.fill_td_list(dateString);

        //오늘의 할 일 성과 표시
        this.display_count();
    }//display_all


    /**
     * TO DO LIST에 표시되는 날짜를 변경합니다
     * @param {String}dateString yyyy-mm-dd
     */
    change_curr_date(dateString){
        this.currDate = dateString
    }//change_curr_date

    /** 
     * 날짜 변경 
     * @param {String}dateString yyyy-mm-dd
    */
    display_date_info(dateString){
        const [yyyy,mm,dd] = dateString.split('-');
        this.$year.textContent = yyyy;
        this.$month.textContent = mm;
        this.$date.textContent = String(dd).padStart(2,"0");

        const day = this.days[new Date(dateString).getDay()];
        this.$day.textContent = day;
    }//display_date_info

    /** 
     * 오늘이면 아이콘 표시 
     * @param {String}dateString yyyy-mm-dd
     * */
    is_today(dateString){
        const bool = dateString == this.today;
        this.$icToday.classList.toggle("off", !bool);
    }//is_today

    /** 
     * form에 내용 등록시
     */
    on_submit = e => {
        e.preventDefault();
        const val = this.$formIpt.value.trim();
        if(!val) return;

        //ipt내용 비우고 다시 포커스 주기
        this.$formIpt.value = "";
        this.$formIpt.focus();

        //리스트에 아이템 추가
        const $item = this.make_td_item(val,false);
        $item.style.animation = `display-td-item 0.5s 0s linear both`;
        this.$tdList.appendChild($item);
        this.$tdList.scrollTo({
            top : this.$tdList.scrollHeight,
            behavior : "smooth"
        })

        //this.data에 추가
        this.add_data(val,false);
    }//on_submit

    /**
     * 날짜로부터 할 일들을 받아와서 todoList에 채워줍니다
     * @param {String} dateString yyyy-mm-dd 
     */
    fill_td_list(dateString){
        //비우고
        this.$tdList.innerHTML = '';

        //DOM 추가
        const items = this.data[dateString];
        if(!items?.length) return;
        const $frag = document.createDocumentFragment();
        items.forEach((item,idx) => {
            const {val,done} = item;
            const $item = this.make_td_item(val,done);
            $item.style.animation = `display-td-item 0.5s ${(idx / 10)}s linear both`;
            $frag.appendChild($item);
        });
        this.$tdList.appendChild($frag);
    }//fill_td_list

    /**
     * 할 일 등록
     * @param {String}val
     * @param {Boolean}done
     * @returns {DOM} LI.td-list-item
     */
    make_td_item(val,done = false){
        //DOM 추가
        const $li = document.createElement('LI');
        const $lbl = document.createElement('LABEL');
        const $chk = document.createElement('INPUT');
        const $ic = document.createElement('SPAN');
        const $txt = document.createElement('P');
        const $btnDel = document.createElement('BUTTON');

        $li.classList.add('td-list-item');
        $lbl.classList.add('lbl-chk');
        $chk.type = "checkbox";
        $chk.checked = done;
        $ic.classList.add('ic');
        $txt.classList.add('td-list-item-txt');
        $txt.textContent = val;
        $btnDel.classList.add('btn-del');
        $btnDel.title = "삭제";

        $lbl.appendChild($chk);
        $lbl.appendChild($ic);
        $lbl.appendChild($txt);
        $li.appendChild($lbl);
        $li.appendChild($btnDel);
        return $li;
    }//make_td_item

    /**
     * 할 일 아이템 삭제
     * @param {DOM} $btnDel
     */
    delete_td_item($btnDel){
        const $li = $btnDel.parentElement;
        const val = $li.getElementsByClassName('td-list-item-txt')[0].textContent;

        //DOM 제거
        this.$tdList.removeChild($li);

        //data에서도 삭제 
        this.remove_data(val);
    }//delete_td_item

    /**
     * 할 일 계산
     */
    display_count(){
        const $$li = Array.from(this.$tdList.children);
        const len = $$li.length;


        //오늘의 할 일 없을 때
        if(!len){
            this.$countText.textContent = '할 일을 등록해보세요!';
            this.$countBar.style.width = '0%';
            this.$countNum.textContent = '0%';
            return;
        }

        const done = $$li.filter($li => {
            const $ipt = $li.querySelector('INPUT');
            if($ipt.checked) return $li;
        }).length;

        const per = parseInt((done / len).toFixed(2) * 100);

        this.$countText.innerHTML = per == 100 ? '👍 <strong>대단해요! 할 일을 전부 해냈습니다!</strong>' :`<strong>${len}</strong>개의 할 일 중 <strong>${done}</strong>개를 달성하였습니다.`;
        this.$countBar.style.width = `${per}%`;
        this.$countNum.textContent = `${per}%`;
    }//display_count

    /**
     * this.data에 새 아이템을 등록합니다
     * @param {String}val value
     * @param {Boolean}done 
     */
    add_data(val,done){
        const obj = {
            val : val,
            done : done ?? false
        }
        if(!this.data[this.currDate]) this.data[this.currDate] = []; 
        this.data[this.currDate].push(obj);

        console.log(this.data);
    }//add_data

    /**
     * data에서도 제거
     * @param {String} val value
     */
    remove_data(val){
        if(!this.data[this.currDate]) return;
        const idx = this.data[this.currDate].findIndex(item=>item.val == val);
        if(idx < 0) return;
        this.data[this.currDate].splice(idx,1);

        console.log(this.data);
    }//remove_data

    /**
     * 체크박스시 data의 값을 수정합니다
     * @param {DOM}$ipt input[type="checkbox"]
     */
    modify_data($ipt){
        const val = $ipt.parentElement.getElementsByClassName('td-list-item-txt')[0].textContent;
        const done = $ipt.checked;
        const idx = this.data[this.currDate].findIndex(item=>item.val == val);
        if(idx < 0) return;
        this.data[this.currDate][idx].done = done;
    }//modify_data
}//class-ToDoList