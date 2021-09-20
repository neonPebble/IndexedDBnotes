const list = document.querySelector('ul');                                  //only for this project
const titleInput = document.querySelector('#title');                        //only for this project
const bodyInput = document.querySelector('#body');                          //only for this project
const form = document.querySelector('form');                                //only for this project
const submitBtn = document.querySelector('form button');                    //only for this project
let db;





/*let cssLight = document.createElement('link');
cssLight.setAttribute('href', 'notes.css');
cssLight.setAttribute('relative', 'stylesheet');*/



let darkBtn = document.querySelector('.dBtn');
darkBtn.onclick = function() {
    document.documentElement.classList.toggle('darkMl');

    if(document.documentElement.className == "darkMl"){
        /*document.querySelector('link[href="notes.css"]').remove();*/
        darkBtn.textContent = "D";
    } else {
        darkBtn.textContent = "L";
        /*document.querySelector('head').appendChild(cssLight);*/
    }
}



window.onload = function() {
    let request = window.indexedDB.open('notes_db', 1);

    request.onerror = function(){
        console.log("Database failed to open.");
    };
  

    request.onsuccess = function() {
        console.log("Database opened successfully.")
        db = request.result;
        displayData();
    };

    request.onupgradeneeded = function(e) {
        let db = e.target.result;
        let objectStore = db.createObjectStore('notes_os', {keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('title', 'title', {unique: false});
        objectStore.createIndex('body', 'body', {unique: false});
        console.log('Database setup comlete');
    };


    form.onsubmit = addData;
  
    function addData(e) {
        e.preventDefault();
  
        let newItem = {'title': titleInput.value, body: bodyInput.value};         //only for this project
  
        let transaction = db.transaction(['notes_os'], 'readwrite');
  

        let objectStore = transaction.objectStore('notes_os');
  
  
        let request = objectStore.add(newItem);

        request.onsuccess = function() {
            titleInput.value = '';                                                //only for this project
            bodyInput.value = '';                                                 //only for this project
        };
  
        transaction.oncomplete = function(){
            console.log("Transaction completed: Database modification finished.");
  
            displayData();
        };
  

          transaction.onerror = function() {
          console.log("Transaction not opened due to error");
        };
    }


    function displayData() {
        while(list.firstChild) {
            list.removeChild(list.firstChild);                                    //only for this project
        }
  
            let objectStore = db.transaction('notes_os').objectStore("notes_os");
            objectStore.openCursor().onsuccess = function(e){
                let cursor = e.target.result;
  
                if(cursor) {
                  const listItem = document.createElement('li');                  //only for this project
                  const h3 = document.createElement('h3');                        //only for this project
                  const para = document.createElement('p');                       //only for this project
            
                  listItem.appendChild(h3);                                       //only for this project
                  listItem.appendChild(para);                                     //only for this project
                  list.appendChild(listItem);                                     //only for this project
  

                  h3.textContent = cursor.value.title;                            //only for this project
                  para.textContent = cursor.value.body;                           //only for this project
                  
                  para.setAttribute('class','newlnPara');
                  listItem.setAttribute("class", "dNote");
                  listItem.setAttribute('data-note-id', cursor.value.id);         //*for this project but... sets a custom attribute and saves reference to id of the data item in database.
                  
                  
                  let deleteBtn = document.createElement('button');             //Create delete btn inside list item.
                  listItem.appendChild(deleteBtn);
                  deleteBtn.textContent = 'Delete';

                  deleteBtn.onclick = deleteItem;


                  let editBtn = document.createElement('button');
                  editBtn.textContent = " Edit ";
                  listItem.appendChild(editBtn);
             
                  editBtn.onclick = editItem;
                  
                  
                  cursor.continue();
  
                } else{
                  
                  if(!list.firstChild){
  
                      const listItem = document.createElement('li');              //for this project only
                      listItem.textContent = 'No notes stored.';                  //for this project only
                      list.appendChild(listItem);                                 //for this project only

                  }
                
                  console.log('All notes displayed');                             //confirmation to console

                }
            };

            // what about on error?
  
            
        
    }

   
    function deleteItem(e) {                                                      //this function is mostly for this project. customize before reusing.
        let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));
        
  
        let transaction = db.transaction(['notes_os'], 'readwrite');              
        let objectStore = transaction.objectStore('notes_os');
        let request = objectStore.delete(noteId);
        
  
  
        transaction.oncomplete = function() {
         
            e.target.parentNode.parentNode.removeChild(e.target.parentNode);
            console.log('Note ' + noteId + ' deleted.');

            if(!list.firstChild) {                                    // really bad way to display issue. Pls fix on other projects.
              let listItem = document.createElement('li');
              listItem.textContent = 'No notes stored.';
              list.appendChild(listItem);
            }
        };
  
    }
  

    function editItem(e) {
        let edNote = e.target.parentNode;
        let noteId = Number(edNote.getAttribute('data-note-id'));
        

        
        let edPara = edNote.querySelector('p');
        let edHead = edNote.querySelector('h3');

        let newPara = document.createElement('textarea');
        newPara.value = edPara.textContent;

        let newHead = document.createElement('input');
        newHead.value = edHead.textContent;

        let cancelBtn = document.createElement('button');
        cancelBtn.textContent = "Cancel";

        let doneBtn = document.createElement('button');
        doneBtn.textContent = "Done";

        let oldHead = edNote.removeChild(edHead);                        //saved in case of cancel.
        let oldPara = edNote.removeChild(edPara);
            
        
        while(edNote.lastChild) {
            edNote.removeChild(edNote.lastChild);
        }

        edNote.appendChild(newHead);
        edNote.appendChild(newPara);
        newPara.setAttribute('class', "nPara");
        newPara.setAttribute("rows", "5");
        edNote.appendChild(doneBtn);
        edNote.appendChild(cancelBtn);

        cancelBtn.onclick = function(){
            chngNote(oldHead,oldPara);
        }

        doneBtn.onclick = function () {                                //this doesnt work!??!!
            let transaction = db.transaction('notes_os', 'readwrite');
            let objectStore = transaction.objectStore('notes_os');
            
            let request = objectStore.put({'title': newHead.value, 'body': newPara.value, "id": noteId}); // this is failing.
            
            request.onerror = function(e){
                console.log('error:\n');
                console.log(e.target.error);

                chngNote(oldHead,oldPara);
            }

            request.onsuccess = function(){
                oldHead.textContent = newHead.value;
                oldPara.textContent = newPara.value;

                chngNote(oldHead,oldPara);
                  
            }
        }

        function chngNote (chngHead,chngPara){

            while(edNote.lastChild) {
                edNote.removeChild(edNote.lastChild);
            }
            edNote.appendChild(chngHead);
            edNote.appendChild(chngPara);
            
            const deleteBtn = document.createElement('button');             //Create delete btn inside list item.
            edNote.appendChild(deleteBtn);
            deleteBtn.textContent = 'Delete';

            deleteBtn.onclick = deleteItem;


            const editBtn = document.createElement('button');
            editBtn.textContent = " Edit ";
            edNote.appendChild(editBtn);
         
            editBtn.onclick = editItem;
        }
        

    }
    
  
};