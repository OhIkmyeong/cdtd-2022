import { return_date_string } from "./FN.js";

/** 📌달력 관련 */
export class Calendar {
    /** 달력 관련 */
    constructor(){
        this.$head = document.getElementById('cd-head');
        this.$year = document.getElementById('cd-head-yy');
        this.$monthNum = document.getElementById('cd-head-mm-num');
        this.$monthEng = document.getElementById('cd-head-mm-eng');
        this.$tbody = document.getElementById('cd').getElementsByTagName('TBODY')[0];

        this.today = return_date_string(new Date());
        this.curr = this.today; 

        this.mm = ["January","February","March","April","May","June","July","August","Septemper","October","November","December"];

        this.TODO = null;
    }//constructor

    /** 
     * 최초 화면 로드시  
     * @param {Class} TODO To Do List 클래스 받아오기
    */
    init(TODO){
        //todo 클래스 받아오기
        this.TODO = TODO;

        //상단날짜, 캘린더 채우기
        this.display_all(this.today);
        
        //좌우 버튼에 이벤트 달기
        this.$head.addEventListener('click',this.on_click_prev_next);

        //tbody에 이벤트 달기
        this.$tbody.addEventListener('click',this.on_click_btn_date);
    }//init

    /**
     * 캘린더, 상단 날짜 전체 변경
     * @param {String}dateString yyyy-mm-dd
     */
    display_all(dataString){
        //tbody reset
        this.reset_tbody();
                
        //상단 날짜 표기
        this.display_cd_head(dataString);

        //달력 채우기
        this.draw_calendar(dataString);
    }//display_all

    /** reset tbody */
    reset_tbody(){
        this.$tbody.innerHTML = '';
    }//reset_tbody

    /**
     * 상단의 날짜 표기
     * @param {String}dateString yyyy-mm-dd
     */
    display_cd_head(dateString){
        const [yyyy,mm] = dateString.split('-');
        this.$year.textContent = yyyy;
        this.$monthNum.textContent = mm;
        this.$monthEng.textContent = this.mm[Number(mm) - 1];
    }//display_cd_head

    /**
     * 📌달력 날짜 채우기
     * @param {String} dateString yyyy-mm-dd 
     * @memo https://jerryjerryjerry.tistory.com/26
     */
    draw_calendar(dateString){
        const [cy,cm,cd] = dateString.split('-');
        const start = new Date(cy,Number(cm)-1,1);
        const last = new Date(cy, cm, 0);

        let cnt = start.getDay();
        let $tr = this.$tbody.insertRow();

        //날짜 첫 요일까지 빈칸 삽입
        for(let k=0; k<cnt; k++) $tr.insertCell();

        //날짜 그리기
        for(let i=1; i<=last.getDate(); i++){
            cnt++;
            const $td = $tr.insertCell();
            const dataString = `${cy}-${cm.padStart(2,"0")}-${String(i).padStart(2,"0")}`; 
            
            //날짜 버튼 추가
            const $btn = document.createElement("BUTTON");
            $btn.classList.add('cd-cell');
            $btn.textContent = i;
            $btn.dataset.dateInfo = dataString;
            if( dataString == this.today) $btn.classList.add('today');
            $td.appendChild($btn);

            //남아있는일,한 일 표시
            const thisTodo = this.TODO.data[dataString]; 
            if(thisTodo?.length){
                const rmn = thisTodo.filter(obj=>!obj.done).length;
                const done = thisTodo.length - rmn;
                if(rmn){
                    const $rmn = document.createElement('DIV');
                    $rmn.classList.add('cd-td-num');
                    $rmn.classList.add('rmn');
                    $rmn.textContent = rmn;
                    $rmn.title = `${rmn}개의 업무가 남아있습니다.`;
                    $td.appendChild($rmn);
                }
                
                if(done){
                    const $done = document.createElement('DIV');
                    $done.classList.add('cd-td-num');
                    $done.classList.add('done');
                    $done.textContent = done;
                    $done.title = rmn ? `${done + rmn}개중 ${done}개 완료!` : `전부 완료!`;
                    $td.appendChild($done);
                }
            }//if

            //줄바꿈,토요일
            if(cnt  % 7 == 0){
                $tr = this.$tbody.insertRow();
                $btn.classList.add('saturday');
            }//if

            //일요일
            if(cnt % 7 == 1) $btn.classList.add('sunday');
        }//for
    }//draw_calendar

    /**
     * tbody의 날짜 버튼을 클릭시
     * @param {Event}e
     */
    on_click_btn_date = (e) =>{
        if(e.target.tagName != "BUTTON") return;

        //클래스 "on" toggle
        const $BTN = e.target;
        const $$btn = this.$tbody.querySelectorAll('BUTTON');
        $$btn.forEach($btn => $btn.classList.toggle('on', $btn == $BTN));

        //to do list에 반영
        const dataString = $BTN.dataset.dateInfo;
        this.TODO.display_all(dataString);
    }//on_click_btn_date

    /**
     * 캘린더의 표시 수정
     */
    change_rmn_done(dataString){
        const $btn = this.$tbody.querySelector(`[data-date-info="${dataString}"]`)
        if(!$btn) return;
        const $cell = $btn.parentElement;
        const thisTodo = this.TODO.data[dataString];
        const rmn = thisTodo.filter(item => !(item.done)).length;
        const done = thisTodo.length - rmn;

        const $rmn = $cell.getElementsByClassName('rmn')[0];
        const $done = $cell.getElementsByClassName('done')[0];

        //남아있는거 처리
        if(!rmn){
            $rmn && $cell.removeChild($rmn);
        }else{
            if($rmn){
                $rmn.textContent = rmn;
            }else{
                const $rmnNew = document.createElement('DIV');
                $rmnNew.classList.add('cd-td-num');
                $rmnNew.classList.add('rmn');
                $rmnNew.textContent = rmn;
                $cell.appendChild($rmnNew);
                if($done) $cell.insertBefore($rmnNew,$done);
            }
        }//if-rmn

        //해결한거 처리
        if(!done){
            $done && $cell.removeChild($done);
        }else{
            if($done){
                $done.textContent = done;
            }else{
                const $doneNew = document.createElement('DIV');
                $doneNew.classList.add('cd-td-num');
                $doneNew.classList.add('done');
                $doneNew.textContent = done;
                $cell.appendChild($doneNew);
            }
        }//if-done
    }//change_rmn_done

    /** 
     * 달력 바꾸기 (전,후) 버튼 클릭시
     */
    on_click_prev_next = e => {
        if(e.target.tagName != "BUTTON") return;
        const dir = [...e.target.id.matchAll(/(btn\-mm\-)(\w*)/g)][0][2];
        const prevNext = dir == "next" ? 1 : -1;
        const [yyyy,mm] = this.curr.split('-');
        const newDate = new Date(yyyy, Number(mm - 1) + prevNext, 1);
        this.curr = return_date_string(newDate);

        this.display_all(this.curr);
    }//on_click_prev_next
}//class-Calendar