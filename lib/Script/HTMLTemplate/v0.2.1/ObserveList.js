window.ObserveList=(function ()
{
    //ArrayList
    function ArrayList()
    {
        var list=[];
        list.add = function (obj)
        {
            list[list.length] = obj;
            return list.length - 1;
        };
        list.insert = function (obj, index)
        {
            if (isNaN(index) || index < 0)
            {
                throw new Error("Invalid index.");
            }
            for (var i = this.length-1; i >=index; i--)
            {
                this[i + 1] = this[i];
            }
            this[index] = obj;
        }
        list.removeAt = function (index)
        {
            if (isNaN(index) || index < 0 || index >= list.length)
            {
                throw new Error("Invalid index.");
            }
            for (var i = index; i < list.length - 1; i++)
            {
                list[i] = list[i + 1];
            }
            list.length -= 1;
        }
        list.remove = function (obj)
        {
            for (var i = 0; i < list.length; i++)
            {
                if (list[i] == obj)
                {
                    for (; i < list.length - 1; i++)
                    {
                        list[i] = list[i + 1];
                    }
                    list.length -= 1;
                    return;
                }
            }
            throw new Error("Object not found.");
        }
        list.clear = function ()
        {
            list.length = 0;
        }
        list.addRange = function (arr, startIndex, count)
        {
            if (!startIndex || isNaN(startIndex))
                startIndex = 0;
            if (!count || isNaN(count))
                count = arr.length;
            for (var i = startIndex; i < count; i++)
            {
                list[list.length] = arr[i];
            }
        }
        list.contain = function (obj)
        {
            return (list.indexOf(obj) >= 0);
        }
        return list;
    }
    
    var Event=(function()
    {
        function Event()
        {
            this.def=null;
            this.handlers=ArrayList();
        }
        Event.prototype.invoke=function(args)
        {
            if(!args["handled"])
                args.handled=false;
            if(this.def)
                this.def(args);
            for(var i=0;i<this.handlers.length;i++)
            {
                if(args.handled)
                    return;
                if(this.handlers[i])
                    this.handlers[i](args);
            }
        }
        Event.prototype.add=function(handler)
        {
            
            this.handlers.add(handler);
        }
        Event.prototype.remove=function(handler)
        {
            if(this.def==handler)
                this.def=null;
            this.handlers.remove(handler);
        }
        
        function EventManager()
        {
            this.events={};
            this.eventNames=ArrayList();
        }
        EventManager.prototype.register=function(name,event)
        {
            if(name==undefined || name==null)
                throw new Error("A name of the event required.");
            if(this.eventNames.indexOf(name)>0)
                throw new Error("Event existed.");
            this.events[name]=event;
            this.eventNames.add(name);
        }
        Event.EventManager=EventManager;
        
        function defineEvent(obj,name,handler)
        {
            if(!obj)
                throw new Error("An object required.");
            if(name==undefined || name==null)
                throw new Error("A name of the event required.");
            if(!obj.eventManager)
            {
                obj.eventManager=new EventManager();
                
            }
            
            if(obj.eventManager.eventNames.contain(name))
                throw new Error("Event existed.");
            var event=new Event();
            obj.eventManager.register(name);
            Object.defineProperty(obj,name,{
                get:function()
                {
                    return event;
                },
                set:function(handler)
                {
                    event.def=handler;
                }
            })
        }
        Event.defineEvent=defineEvent;
        return Event;
    })();
    
    /**
     * 
     * @param {Array} listSrc 
     */
    function ObserveList(listSrc)
    {
        var obsList=this;
        var list=[];
        Object.defineProperty(this,"length",{
            get: function(){
                return list.length;
            }
        });
        
        Event.defineEvent(this,"onRemove");
        Event.defineEvent(this,"onInsert");
        Event.defineEvent(this,"onChange");
        function addNode(index)
        {
            Object.defineProperty(obsList,index,{
                configurable:true,
                get:function()
                {
                    return list[index];
                },
                set:function(value)
                {
                    var args={
                        index:index,
                        old:list[index],
                        item:value,
                        cancle:false
                    };
                    obsList.onRemove.invoke(args);
                    if(args.cancle)
                        return false;
                    obsList.onChange.invoke(args);
                    list[index]=value;
                }
            });
        }
        function removeNode(index)
        {
            delete obsList[index];
        }
        this.add=function(obj)
        {
            var args={
                index:list.length,
                item:obj,
                cancle:false
            }
            obsList.onInsert.invoke(args);
            if(args.cancle)
                return false;
            addNode(list.length);
            list[list.length]=obj;
            return list.length-1;
        }
        this.removeAt=function(index)
        {
            var args={
                index:index,
                item:list[index],
                cancle:false
            };
            obsList.onRemove.invoke(args);
            if(args.cancle)
                return false;
            for(var i=index;i<list.length---1;i++)
            {
                list[i]=list[i+1];
            }
            list.length--;
            removeNode(list.length);
        }
        this.remove=function(obj)
        {
            obsList.removeAt(list.indexOf(obj));
        }
        this.insert=function(obj,index)
        {
            var args={
                index:index,
                item:obj,
                cancle:false
            };
            obsList.onInsert.invoke(args);
            if(args.cancle)
                return false;
            addNode(list.length);
            for(var i=list.length;i>index;i--)
            {
                list[i]=list[i-1];
            }
            list[index]=obj;
        }
        this.addRange = function (array)
        {
            for (var i = 0; i < array.length; i++)
            {
                obsList.add(array[i]);
            }    
        }    

        if (listSrc instanceof Array)
        {
            for (var i = 0; i < listSrc.length; i++)
            {
                this.add(listSrc[i]);
            }
        }
    }
    return ObserveList;
})();