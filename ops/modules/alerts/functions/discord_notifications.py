import os
import json
import logging
import http.client

# ---------------------------------------------------------------------------------------------------------------------
# ENVIRONMENTAL VARIABLES
# ---------------------------------------------------------------------------------------------------------------------

# Boolean flag, which determins if the incoming even should be printed to the output.
LOG_EVENTS = os.getenv("LOG_EVENTS", "False").lower() in ("true", "1", "t", "yes", "y")

DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "")
if DISCORD_WEBHOOK_URL == "":
    raise RuntimeError(
        "The required env variable DISCORD_WEBHOOK_URL is not set or empty!"
    )

# Set the log level
log = logging.getLogger()
log.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

# ---------------------------------------------------------------------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------------------------------------------------------------------

# Input: EventBridge Message detail_type and detail
# Output: mrkdwn text


def ecs_events_parser(detail_type, detail):
    emoji_event_type = {
        "ERROR": ":exclamation:",
        "WARN": ":warning:",
        "INFO": ":information_source:",
    }
    emoji_event_name = {
        "SERVICE_DEPLOYMENT_IN_PROGRESS": ":arrows_counterclockwise:",
        "SERVICE_DEPLOYMENT_COMPLETED": ":white_check_mark:",
        "SERVICE_DEPLOYMENT_FAILED": ":x:",
    }
    emoji_task_status = {
        "PROVISIONING": ":clock1:",
        "PENDING": ":clock6:",
        "ACTIVATING": ":clock11:",
        "RUNNING": ":arrow_up:",
        "DEACTIVATING": ":arrow_left:",
        "STOPPING": ":rewind:",
        "DEPROVISIONING": ":track_previous:",
        "STOPPED": ":stop_sign:",
    }

    if detail_type == "ECS Container Instance State Change":
        result = (
            f"*Instance ID:* "
            + detail["ec2InstanceId"]
            + "\n"
            + "• Status: "
            + detail["status"]
        )
        if "statusReason" in detail:
            result = result + "\n" + "• Reason: " + detail["statusReason"]
        return result

    if detail_type == "ECS Deployment State Change":
        result = (
            f"*Event Detail:*"
            + emoji_event_type.get(detail["eventType"], "")
            + emoji_event_name.get(detail["eventName"], "")
            + "\n"
            + "• "
            + detail["eventType"]
            + " - "
            + detail["eventName"]
            + "\n"
            + "• Deployment: "
            + detail["deploymentId"]
            + "\n"
            + "• Reason: "
            + detail["reason"]
        )
        return result

    if detail_type == "ECS Service Action":
        result = (
            f"*Event Detail:*"
            + emoji_event_type.get(detail["eventType"], "")
            + emoji_event_name.get(detail["eventName"], "")
            + "\n"
            + "• "
            + detail["eventType"]
            + " - "
            + detail["eventName"]
        )
        if "capacityProviderArns" in detail:
            capacity_providers = ""
            for capacity_provider in detail["capacityProviderArns"]:
                try:
                    capacity_providers = (
                        capacity_providers
                        + capacity_provider.split(":")[5].split("/")[1]
                        + ", "
                    )
                except Exception:
                    log.error(
                        "Error parsing clusterArn: `{}`".format(capacity_provider)
                    )
                    capacity_providers = capacity_providers + capacity_provider + ", "
            if capacity_providers != "":
                result = result + "\n" + "• Capacity Providers: " + capacity_providers
        return result

    if detail_type == "ECS Task State Change":
        container_instance_id = "UNKNOWN"
        if "containerInstanceArn" in detail:
            try:
                container_instance_id = (
                    detail["containerInstanceArn"].split(":")[5].split("/")[2]
                )
            except Exception:
                log.error(
                    "Error parsing containerInstanceArn: `{}`".format(
                        detail["containerInstanceArn"]
                    )
                )
                container_instance_id = detail["containerInstanceArn"]
        try:
            task_definition = (
                detail["taskDefinitionArn"].split(":")[5].split("/")[1]
                + ":"
                + detail["taskDefinitionArn"].split(":")[6]
            )
        except Exception:
            log.error(
                "Error parsing taskDefinitionArn: `{}`".format(
                    detail["taskDefinitionArn"]
                )
            )
            task_definition = detail["taskDefinitionArn"]
        try:
            task = detail["taskArn"].split(":")[5].split("/")[2]
        except Exception:
            log.error("Error parsing taskArn: `{}`".format(detail["taskArn"]))
            task = detail["taskArn"]
        result = (
            f"*Event Detail:* "
            + "\n"
            + "• Task Definition: "
            + task_definition
            + "\n"
            + "• Last: "
            + detail["lastStatus"]
            + " "
            + emoji_task_status.get(detail["lastStatus"], "")
            + "\n"
            + "• Desired: "
            + detail["desiredStatus"]
            + " "
            + emoji_task_status.get(detail["desiredStatus"], "")
        )
        if container_instance_id != "UNKNOWN":
            result = result + "\n" + "• Instance ID: " + container_instance_id
        if detail["lastStatus"] == "RUNNING":
            if "healthStatus" in detail:
                result = result + "\n" + "• HealthStatus: " + detail["healthStatus"]
        if detail["lastStatus"] == "STOPPED":
            if "stopCode" in detail:
                result = result + "\n" + ":bangbang: Stop Code: " + detail["stopCode"]
            if "stoppedReason" in detail:
                result = (
                    result + "\n" + ":bangbang: @here Stop Reason: " + detail["stoppedReason"]
                )
        return result

    return f"*Event Detail:* ```{json.dumps(detail, indent=4)}```"


# Input: EventBridge Message
# Output: discord Message
def event_to_discord_message(event):
    event_id = event.get("id")
    detail_type = event.get("detail-type")
    account = event.get("account")
    time = event.get("time")
    region = event.get("region")
    resources = []
    for resource in event["resources"]:
        try:
            resources.append(":dart: " + resource.split(":")[5])
        except Exception:
            log.error("Error parsing the resource ARN: `{}`".format(resource))
            resources.append(":dart: " + resource)
    detail = event.get("detail")
    known_detail = ecs_events_parser(detail_type, detail)
    fields = list()
    title = f"*{detail_type}*"

    fields.append({"name": "Event Id", "value": f"Id: {event_id}", "inline": True})
    fields.append({"name": "AWS Account and Region", "value": f"Account: {account} Region: {region}", "inline": True})
    fields.append({"name": "Date", "value": f"Time: {time} UTC", "inline": True})
    if resources:
        fields.append({"name": "resources", "value": "*Resources*:\n" + "\n".join(resources)})

    if detail and not known_detail:
        fields.append({"name": "resources", "value": f"*Event Detail:* ```{json.dumps(detail, indent=4)}```"})

    if known_detail:
        fields.append({"name": "Date", "value": known_detail})

    return {
        "content": "ECS Event",
        "embeds": [
            {
                "title": title,
                "thumbnail": {
                    "url": "https://miro.medium.com/max/303/1*PRgMAcj1QMD0ggK4Ygxo0Q.png",
                    "height": 16,
                    "width": 16,
                },
                "fields": fields
            }
        ],
    }


# discord web hook example
# https://hooks.discord.com/services/XXXXXXX/XXXXXXX/XXXXXXXXXX
def post_discord_message(hook_url, message):
    log.debug(f"Sending message: {json.dumps(message)}")
    headers = {"Content-type": "application/json"}
    connection = http.client.HTTPSConnection("discord.com")
    connection.request(
        "POST",
        hook_url.replace("https://discord.com", ""),
        json.dumps(message),
        headers,
    )
    response = connection.getresponse()
    print(response.read().decode())
    log.debug(
        "Response: {}, message: {}".format(response.status, response.read().decode())
    )
    return response.status


# ---------------------------------------------------------------------------------------------------------------------
# LAMBDA HANDLER
# ---------------------------------------------------------------------------------------------------------------------


def lambda_handler(event, context):
    if LOG_EVENTS:
        log.info("Event logging enabled: `{}`".format(json.dumps(event)))

    if event.get("source") != "aws.ecs":
        raise ValueError('The source of the incoming event is not "aws.ecs"')

    discord_message = event_to_discord_message(event)
    response = post_discord_message(DISCORD_WEBHOOK_URL, discord_message)
    if response not in (200, 204):
        log.error(
            "Error: received status `{}` using event `{}` and context `{}`".format(
                response, event, context
            )
        )
    return json.dumps({"code": response})


# For local testing
if __name__ == "__main__":
    with open("./test/eventbridge_event.json") as f:
        test_event = json.load(f)
    print(test_event)
    print(DISCORD_WEBHOOK_URL)
    lambda_handler(test_event, "default_context")
