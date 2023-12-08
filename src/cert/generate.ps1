# Set the Common Name (CN)
$commonName = "localhost"

# Create private key
openssl genpkey -algorithm RSA -out cert_server.key

# Create Certificate Signing Request (CSR)
openssl req -new -key cert_server.key -out cert_server.csr -subj "/CN=$commonName"

# Create self-signed certificate
openssl req -x509 -key cert_server.key -in cert_server.csr -out cert_server.crt -days 3650
