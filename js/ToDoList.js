import { return_date_string } from "./FN.js";

/** ๐TO DO LIST ๊ด๋ จ */
export class ToDoList {
    /** TO DO LIST ๊ด๋ จ */
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
     * ์ต์ด ํ๋ฉด ๋ก๋์  
     * @param {Class}CAL ์บ๋ฆฐ๋ ํด๋์ค ๋ฐ์์ค๊ธฐ
    */
    async init(CAL){
        //์บ๋ฆฐ๋ ํด๋์ค ๋ฐ์์ค๊ธฐ
        this.CAL = CAL;

        //๋ฐ์ดํฐ ์ค์ 
        this.data = await fetch('./json/data.json').then(res=>res.json()).then(json=>json.todo);
        
        //์ค๋ ๋ ์ง ์ค์ 
        this.today = return_date_string(new Date());

        //ํ๋ฉด ๋ณ๊ฒฝ ์ด๊ด
        this.display_all(this.today);

        //form์ ์ด๋ฒคํธ ์ถ๊ฐ
        this.$form.addEventListener('submit',(e)=>{
            //๋ฑ๋ก์
            this.on_submit(e);
            
            //์นด์ดํธ ์์ 
            this.display_count();

            //์บ๋ฆฐ๋์ ํ์ ์์ 
            this.CAL.change_rmn_done(this.currDate);
        });

        //to do list์ ์ด๋ฒคํธ ์ถ๊ฐ(์ญ์  ๊ฐ๋ฅํ๋๋ก);
        this.$tdList.addEventListener('click',(e)=>{
            switch(e.target.tagName){
                case "BUTTON" : {
                    /* ์ญ์ ๋ฒํผ */
                    //์์ดํ ์ง์ฐ๊ณ  ๋ฐ์ดํฐ์์๋ ์ญ์ 
                    this.delete_td_item(e.target);

                    //์นด์ดํธ ์์ 
                    this.display_count();

                    //์บ๋ฆฐ๋์ ํ์ ์์ 
                    this.CAL.change_rmn_done(this.currDate);
                }break;
                
                case "INPUT" : {
                    /* ์ฒดํฌ๋ฐ์ค */
                    //๋ฐ์ดํฐ์์ ์์ 
                    this.modify_data(e.target);

                    //์นด์ดํธ ์์ 
                    this.display_count();

                    //์บ๋ฆฐ๋์ ํ์ ์์ 
                    this.CAL.change_rmn_done(this.currDate);
                }break;
            }//switch
        });
    }//init

    /**
     * ํ๋ฉด ๋ฐ๊พธ๊ธฐ ์ด๊ด
     * @param {String}dateString yyyy-mm-dd
     */
    display_all(dateString){
        //ํ์ฌ ๋ณด์ฌ์ค ๋ ์ง ๋ณ๊ฒฝ
        this.change_curr_date(dateString);
                
        //๋ ์ง ํ์ ๋ณ๊ฒฝ
        this.display_date_info(dateString);

        //์ค๋ ์์ด์ฝ ํ์
        this.is_today(dateString);

        //์ค๋์ ํ  ์ผ ๋ชฉ๋ก ํ์
        this.fill_td_list(dateString);

        //์ค๋์ ํ  ์ผ ์ฑ๊ณผ ํ์
        this.display_count();
    }//display_all


    /**
     * TO DO LIST์ ํ์๋๋ ๋ ์ง๋ฅผ ๋ณ๊ฒฝํฉ๋๋ค
     * @param {String}dateString yyyy-mm-dd
     */
    change_curr_date(dateString){
        this.currDate = dateString
    }//change_curr_date

    /** 
     * ๋ ์ง ๋ณ๊ฒฝ 
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
     * ์ค๋์ด๋ฉด ์์ด์ฝ ํ์ 
     * @param {String}dateString yyyy-mm-dd
     * */
    is_today(dateString){
        const bool = dateString == this.today;
        this.$icToday.classList.toggle("off", !bool);
    }//is_today

    /** 
     * form์ ๋ด์ฉ ๋ฑ๋ก์
     */
    on_submit = e => {
        e.preventDefault();
        const val = this.$formIpt.value.trim();
        if(!val) return;

        //ipt๋ด์ฉ ๋น์ฐ๊ณ  ๋ค์ ํฌ์ปค์ค ์ฃผ๊ธฐ
        this.$formIpt.value = "";
        this.$formIpt.focus();

        //๋ฆฌ์คํธ์ ์์ดํ ์ถ๊ฐ
        const $item = this.make_td_item(val,false);
        $item.style.animation = `display-td-item 0.5s 0s linear both`;
        this.$tdList.appendChild($item);
        this.$tdList.scrollTo({
            top : this.$tdList.scrollHeight,
            behavior : "smooth"
        })

        //this.data์ ์ถ๊ฐ
        this.add_data(val,false);
    }//on_submit

    /**
     * ๋ ์ง๋ก๋ถํฐ ํ  ์ผ๋ค์ ๋ฐ์์์ todoList์ ์ฑ์์ค๋๋ค
     * @param {String} dateString yyyy-mm-dd 
     */
    fill_td_list(dateString){
        //๋น์ฐ๊ณ 
        this.$tdList.innerHTML = '';

        //DOM ์ถ๊ฐ
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
     * ํ  ์ผ ๋ฑ๋ก
     * @param {String}val
     * @param {Boolean}done
     * @returns {DOM} LI.td-list-item
     */
    make_td_item(val,done = false){
        //DOM ์ถ๊ฐ
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
        $btnDel.title = "์ญ์ ";

        $lbl.appendChild($chk);
        $lbl.appendChild($ic);
        $lbl.appendChild($txt);
        $li.appendChild($lbl);
        $li.appendChild($btnDel);
        return $li;
    }//make_td_item

    /**
     * ํ  ์ผ ์์ดํ ์ญ์ 
     * @param {DOM} $btnDel
     */
    delete_td_item($btnDel){
        const $li = $btnDel.parentElement;
        const val = $li.getElementsByClassName('td-list-item-txt')[0].textContent;

        //DOM ์ ๊ฑฐ
        this.$tdList.removeChild($li);

        //data์์๋ ์ญ์  
        this.remove_data(val);
    }//delete_td_item

    /**
     * ํ  ์ผ ๊ณ์ฐ
     */
    display_count(){
        const $$li = Array.from(this.$tdList.children);
        const len = $$li.length;


        //์ค๋์ ํ  ์ผ ์์ ๋
        if(!len){
            this.$countText.textContent = 'ํ  ์ผ์ ๋ฑ๋กํด๋ณด์ธ์!';
            this.$countBar.style.width = '0%';
            this.$countNum.textContent = '0%';
            return;
        }

        const done = $$li.filter($li => {
            const $ipt = $li.querySelector('INPUT');
            if($ipt.checked) return $li;
        }).length;

        const per = parseInt((done / len).toFixed(2) * 100);

        this.$countText.innerHTML = per == 100 ? '๐ <strong>๋๋จํด์! ํ  ์ผ์ ์ ๋ถ ํด๋์ต๋๋ค!</strong>' :`<strong>${len}</strong>๊ฐ์ ํ  ์ผ ์ค <strong>${done}</strong>๊ฐ๋ฅผ ๋ฌ์ฑํ์์ต๋๋ค.`;
        this.$countBar.style.width = `${per}%`;
        this.$countNum.textContent = `${per}%`;
    }//display_count

    /**
     * this.data์ ์ ์์ดํ์ ๋ฑ๋กํฉ๋๋ค
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
     * data์์๋ ์ ๊ฑฐ
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
     * ์ฒดํฌ๋ฐ์ค์ data์ ๊ฐ์ ์์ ํฉ๋๋ค
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