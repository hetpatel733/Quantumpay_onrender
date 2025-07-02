function copyaddress() {
    var address = document.getElementById("address");
    address.select();
    address.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(address.value);
    alert("Copied!!");
}


document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const payid = urlParams.get("payid");

    if (!payid) {
        alert("Missing payid in URL.");
        return;
    }

    async function checkPaymentStatus(payid) {
        try {
            const res = await fetch(`/api/check-status?payid=${encodeURIComponent(payid)}`);
            const data = await res.json();

            if (data.success) {
                const { address, payid, amount, type, status } = data;

                // Update QR code with dynamic amount
                const srcurl = `https://api.qrserver.com/v1/create-qr-code/?data=${address}&amount=${amount}&size=150x150`;
                const imageElement = document.getElementById('qr');
                imageElement.src = srcurl;

                // Update UI fields
                document.getElementById('address').value = address;
                document.getElementById('orderid').innerText = payid;
                document.getElementById('amnt').innerText = amount;
                document.getElementById('type').innerText = type;

                // Show/hide payment status boxes
                const payunsuccess = document.getElementById("unsuccess");
                const paysuccess = document.getElementById("success");
                console.log(status);
                if (status == "completed") {
                    paysuccess.classList.remove("displaynone");
                    payunsuccess.classList.add("displaynone");
                } else if (status == "pending") {
                    paysuccess.classList.add("displaynone");
                    payunsuccess.classList.remove("displaynone");
                } else {
                    document.getElementById("unsuccess").innerText = "Payment Failed! You can Try again";
                }

            } else {
                console.error("❌ Error:", data.message);
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error("⚠️ Network Error:", err);
            alert("Network error while checking payment status.");
        }
    }

    checkPaymentStatus(payid);
});

setInterval(() => {
    window.location.reload();
}, 60000); // 60,000 milliseconds = 1 minute
