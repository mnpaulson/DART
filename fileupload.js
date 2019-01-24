
function getDocument() {
    var url = "https://api.sky.blackbaud.com/gift/v1/documents"
    var key = '4fcb2aee2cdc430c8abd4231690d0cf2'
    var auth = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjREVjZzVkxIM0FtU1JTbUZqMk04Wm5wWHU3WSJ9.eyJuYW1laWQiOiIyZGQ1ZGJmYi04NWMzLTRhNDEtOGQ3OS1kNjVjNjBiM2YzNzkiLCJ0ZW5hbnRpZCI6Ijg1ZjU2N2ZkLTFmOTQtNGRiMy04ZDA2LTZmNGIzYjg0YThkYyIsImFwcGxpY2F0aW9uaWQiOiJhMDU2Y2E2Yi1hM2E4LTRhYzctYjMyNS05OTc2NjYzMDZlNTIiLCJlbnZpcm9ubWVudGlkIjoicC1RWlZrTmJvTThrQ3JFb200TjBFWjZBIiwiZW52aXJvbm1lbnRuYW1lIjoiTGV0aGJyaWRnZSBDb2xsZWdlIEVudmlyb25tZW50IDEiLCJsZWdhbGVudGl0eWlkIjoicC1VMUJHaDZFQ3prQ29NSDdrN1llcVBBIiwibGVnYWxlbnRpdHluYW1lIjoiTGV0aGJyaWRnZSBDb2xsZWdlIiwiUG9kSWQiOiJQb2QgUzIzQTAxIiwiaXNzIjoiaHR0cHM6Ly9vYXV0aDIuc2t5LmJsYWNrYmF1ZC5jb20vIiwiYXVkIjoiUkV4IiwiZXhwIjoxNTQ3MTUwNTU4LCJuYmYiOjE1NDcxNDY5NTh9.HZpwHbuPUIqwtSsMoUYXMXhK1rhlruvifF8NvSTzIbrBd7cMxilv_czXrho9uew6vsB3wJnNLNeQOwys14mJonU7q6rfAMvs3XWtM1E4kn25kaAMgK9BfJlp3pwS77Z3bMStQxyfQAixvpsJnGb3iH0Dsmfe3DYiERqj0HRKUc6h4YQx77nx0VPTN20geyUH4FVlLWm_yl5fecQGkgEfRx38i7yhfe0H5eKfN1dLptED29UIqBQfSAQQIw2DUhY7i5n01eXjaABX01kW8SpLvOQ5awZ-SyYkE5iK0YBlcxfRZxBLiCIeKm9QNtm-9qcKVPnCXv0H5leJO33PS9QYTg'

    var document = new XMLHttpRequest();
    document.open("GET", url, true);
    document.setRequestHeader('bb-api-subscription-key', key);
    document.setRequestHeader('Authorization', auth);
    document.onload = function() {
        var response = JSON.parse(document.response);
        console.table(response);
    }
}

function putDocument() {
    var upload = new XMLHttpRequest();
    upload.open("PUT", url, true);
    upload.setRequestHeader('Content-type', 'application/pdf');
    upload.setRequestHeader('x-ms-version', h[1].value);
    upload.setRequestHeader('x-ms-blob-type', h[0].value);
    upload.onload = function () {
        var test = JSON.parse(upload.responseText);
        console.table(test);
    }
    upload.send(blob);
}

getDocument();