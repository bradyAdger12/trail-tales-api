variable "env-bucket-name" {
    description = "Bucket that hosts env variable"
    type = string
    default = "trail-tales-secret-ba-9348"
}


variable "web-container-port" {
    description = "The frontend port number"
    type = number
    default = 3000
}

variable "web-container-name" {
    description = "The frontend container name"
    type = string
    default = "trail-tales-web"
}

variable "api-container-port" {
    description = "The backend port number"
    type = number
    default = 8080
}

variable "api-container-name" {
    description = "The backend container name"
    type = string
    default = "trail-tales-api"
}

variable "cloudmap-private-dns-namespace" {
    description = "DNS name of private namespace"
    type = string
    default = "trail_tales.local"
}

