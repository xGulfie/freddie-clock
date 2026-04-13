let options = {
    dolphin:true,
    gear: true,
    use24:false,
    load(){
        let s = window.location.hash + window.location.search
        this.dolphin=s.indexOf('D') == -1        
        this.gear=s.indexOf('G') == -1
        if( s.indexOf('24') > -1){
            this.use24=true
        } else if (s.indexOf('12') > -1){
            this.use24=false
        } else {
            let hourCycle = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle;
            this.use24 = !(hourCycle == 'h11' || hourCycle == 'h12');
        }
        this.update()
    },
    update(){
        // write it to the qs
        let s = "?"+(this.dolphin?"d":"D")+(this.gear?"g":"G")+(this.use24?"24":"12");
        window.history.replaceState({}, "", s);
    },
    setDolphin(d){
        this.dolphin = d;
        this.update()
    },
    setGear(g){
        this.gear=g;
        this.update()
    },
    setUse24(a){
        this.use24=a;
        this.update();
    }
}

// immediately read options
options.load()
window.clock_options = options

export {options}