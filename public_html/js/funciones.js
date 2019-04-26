
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var dataBase = null;

var recuperar;


function startDB() {
    dataBase = indexedDB.open('Clientes', 1);
    dataBase.onupgradeneeded = function (e) {
        var active = dataBase.result;
        var object = active.createObjectStore("clientes", {keyPath: 'id', autoIncrement: true});
        object.createIndex('id_cliente', 'id', {unique: true});

        object.createIndex('nombre_cliente', 'nombre', {unique: false});
        object.createIndex('apellido_cliente', 'apellido', {unique: false});
        object.createIndex('cedula_cliente', 'cedula', {unique: true});
        object.createIndex('direccion_cliente', 'direccion', {unique: false});
        object.createIndex('telefono_cliente', 'telefono', {unique: false});

    };

    dataBase.onsuccess = function (e) {
        //  alert('Base de Datos Activa');
        CargaDb();
    };
    dataBase.onerror = function (e) {
        // alert('Error loading database');
    };
}

$("#btnSubmit").on("click", function () {

    alert("Listo para agregar...");


    return add();


});

$("#editar").on("click", function () {
    
    alert("Listo para modificar...");

    return modificar();
    
});

function add() {


    var active = dataBase.result;
    var data = active.transaction(["clientes"], "readwrite");
    var object = data.objectStore("clientes");
    if (validarFormulario()) {
        var request = object.put({
        cedula: document.querySelector("#ci").value,
        nombre: document.querySelector("#nombre").value,
        apellido: document.querySelector("#apellido").value,
        direccion: document.querySelector("#direccion").value,
        telefono: document.querySelector("#telefono").value
    });
    request.onerror = function (e) {
        $('#nombre').focus();
    };
    data.oncomplete = function (e) {
        document.querySelector("#ci").value = '';
        document.querySelector('#nombre').value = '';
        document.querySelector('#apellido').value = '';
        document.querySelector('#direccion').value = '';
        document.querySelector('#telefono').value = '';

        
        $('#nombre').focus();
        CargaDb();
       
        //limpiarFormulario();
    };
    }
    
}

//Refresca la Base de Datos.
function CargaDb() {
    var active = dataBase.result;
    var data = active.transaction(["clientes"], "readonly");
    var object = data.objectStore("clientes");
    var elements = [];
    object.openCursor().onsuccess = function (e) {
        var result = e.target.result;
        if (result === null) {
            return;
        }
        elements.push(result.value);
        result.continue();
    };
    data.oncomplete = function () {
        var outerHTML = '';
        for (var key in elements) {
            outerHTML += '\n\
                        <tr>\n\
                            <td>' + elements[key].id + '</td>\n\
                            <td>' + elements[key].cedula + '</td>\n\
                            <td>' + elements[key].nombre + '</td>\n\
                            <td>' + elements[key].apellido + '</td>\n\
                            <td>' + elements[key].direccion + '</td>\n\
                            <td>' + elements[key].telefono + '</td>\n\
                            <td>\n\<button type="button" id="edition" onclick="recuperar(' + elements[key].id + ')" class="btn btn-info">Editar</button>\n\
                            <td>\n\<button type="button" onclick="deletedate(' + elements[key].id + ')" class="btn btn-danger">Eliminar</button>\n\
                                                    </tr>';
        }
        
        var outerHTML1 = "<tr><td colspan='6'>No hay datos</td></tr>";
        
        if (elements.length !== 0) {
            elements = [];
            document.querySelector("#elementsList").innerHTML = outerHTML;
        }else {
            document.querySelector("#elementsList").innerHTML = outerHTML1;
        }
        
        
    };
}


//Recupera todos los datos y cargo en los input.
function recuperar(id) {
    var active = dataBase.result;
    var data = active.transaction(["clientes"], "readonly");
    var object = data.objectStore("clientes");
    var index = object.index("id_cliente");
    var request = index.get(id);

    //$("#formu").show();
    //$("#busquedaregistro").hide();


    request.onsuccess = function () {
        var result = request.result;
        if (result !== undefined) {
            
            //document.querySelector('#id').value = result.id;
            document.querySelector('#ci').value = result.cedula;
            document.querySelector('#nombre').value = result.nombre;
            document.querySelector('#apellido').value = result.apellido;
            document.querySelector('#direccion').value = result.direccion;
            document.querySelector('#telefono').value = result.telefono;


            //$('#eliminar').attr("disabled", false);
            $('#btnSubmit').attr("disabled", true);
            $('#editar').attr("disabled", false);
            //$('#ci').attr("readonly", true);
            $("#nombre").focus();
            
        }
    };
}

//Funcion que modifica los datos.
function modificar(cedula) {

    var active = dataBase.result;
    var data = active.transaction(["clientes"], "readwrite");
    var objectStore = data.objectStore("clientes");
    var index = objectStore.index('cedula_cliente');
    
    index.openCursor(cedula).onsuccess = function (event) {
        var cursor = event.target.result;
        
        if (cursor) {
            var updateData = cursor.value;
            updateData.cedula = document.querySelector("#ci").value;
            updateData.nombre = document.querySelector("#nombre").value;
            updateData.apellido = document.querySelector("#apellido").value;
            updateData.direccion = document.querySelector("#direccion").value;
            updateData.telefono = document.querySelector("#telefono").value;


            var request = cursor.update(updateData);
            request.onsuccess = function () {
                
                 //$("#modifi").fadeIn();
                 //$("#modifi").fadeOut(3000);
                 $('#btnSubmit').attr("disabled", false);
                 //$('#ci').attr("readonly", false);
                CargaDb();

                limpiarFormulario();
                
                

            };
            request.onerror = function () {
                alert('Error' + '/n/n' + request.error.name + '\n\n' + request.error.message);
                
                CargaDb();
            };
        }
    }
    ;
}

function deletedate(id) {
    var r = confirm("Desea eliminar los datos ?");
    if (r == true) {
        var active = dataBase.result;
        var data = active.transaction(["clientes"], "readwrite");
        var object = data.objectStore("clientes");
        var request = object.delete(id);

        request.onsuccess = function () {

            $("#nombre").focus();
            CargaDb();
            
            limpiarFormulario();
        };
    }else {
        alert("No se borraron datos");
    }

}




function limpiarFormulario() {
    $("#nombre").val("");
    $("#apellido").val("");
    $("#ci").val("");
    $("#direccion").val("");
    $("#telefono").val("");
}

function validarFormulario() {
    $("#msg").css("display", "block");
    var valor = true;
    if ($("#nombre").val().trim() === "") {
        valor = false;
        $("#msg").html("Nombre no puede estar vacio.");
        $("#nombre").focus();
    }
    
    if ($("#apellido").val().trim() === "") {
        valor = false;
        $("#msg").html("Apellido no puede estar vacio.");
        $("#apellido").focus();
    }
    
    if ($("#ci").val().trim() === "") {
        valor = false;
        $("#msg").html("Cedula no puede estar vacio.");
        $("#ci").focus();
    }
    
    if ($("#direccion").val().trim() === "") {
        valor = false;
        $("#msg").html("Direccion no puede estar vacio.");
        $("#direccion").focus();
    }
    
    if ($("#telefono").val().trim() === "") {
        valor = false;
        $("#msg").html("Telefono no puede estar vacio.");
        $("#telefono").focus();
    }
    
    if (valor == true) {
    $("#msg").css("display", "none");
}


    return valor;
}

