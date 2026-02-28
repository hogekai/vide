## 6.4 Client Info

<table>
<tr><td><strong>Name</strong></td><td><code>[IFA]</code></td></tr>
<tr><td><strong>Type</strong></td><td>uuid</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>A resettable advertising ID from a device-specific advertising ID scheme, such as Apple's ID for Advertisers or Android's Advertising ID in UUID format or based on the IAB Tech Lab's Guidelines for IFA on OTT platforms.</td></tr>
<tr><td><strong>Example</strong></td><td><code>123e4567-e89b-12d3-a456-426655440000</code></td></tr>
</table>

<table>
<tr><td><strong>Name</strong></td><td><code>[IFATYPE]</code></td></tr>
<tr><td><strong>Type</strong></td><td>string</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>String value indicating the type of IFA included in the IFA macro. More details in the IAB Tech Lab's Guidelines for IFA on OTT platforms.</td></tr>
<tr><td><strong>Example</strong></td><td>rida</td></tr>
</table>

<table>
<tr><td><strong>Name</strong></td><td><code>[CLIENTUA]</code></td></tr>
<tr><td><strong>Type</strong></td><td>string</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>An identifier of the player and VAST client used. This will allow creative providers to identify the client code used to process and render video creatives.<br>If player name is not available, use "unknown"<br><br>Suggested format:<br><code>{player name}/{player version} {plugin name}/{plugin version}</code></td></tr>
<tr><td><strong>Example</strong></td><td>Unencoded:<br><code>MyPlayer/7.1 MyPlayerVastPlugin/1.1.2</code><br>Encoded:<br><code>MyPlayer%2F7.1%20MyPlayerVastPlugin%2F1.1.2</code><br><br>Unencoded:<br><code>unknown MyPlayerVastPlugin/1.1.2</code><br>Encoded:<br><code>unknown%20MyPlayerVastPlugin%2F1.1.2</code></td></tr>
</table>

<table>
<tr><td><strong>Name</strong></td><td><code>[SERVERUA]</code></td></tr>
<tr><td><strong>Type</strong></td><td>string</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>User-Agent of the server making the request on behalf of a client.<br><br>Only relevant when another device (server) is making the request on behalf of that client.<br><br>The goal is to allow ad servers to identify who is making the request, so don't use generic HTTP server names like <em>Apache</em>, but rather identify the company and product or service making the request.<br><br>Suggested format:<br><code>{service name}/{version} ({URL to vendor info})</code></td></tr>
<tr><td><strong>Example</strong></td><td>Unencoded:<br><code>MyServer/3.0 (+https://myserver.com/contact)</code><br>Encoded:<br><code>MyServer%2F3.0%20(%2Bhttps%3A%2F%2Fmyserver.com%2Fcontact)</code><br><br>Unencoded:<br><code>AdBot-Google (+http://www.google.com/adsbot.html)</code><br>Encoded:<br><code>AdBot-Google%20(%2Bhttp%3A%2F%2Fwww.google.com%2Fadsbot.html)</code></td></tr>
</table>

<table>
<tr><td><strong>Name</strong></td><td><code>[DEVICEUA]</code></td></tr>
<tr><td><strong>Type</strong></td><td>string</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>User-Agent of the device that is rendering the ad to the end user.<br><br>Only relevant when another device (server) is making the request on behalf of that client.</td></tr>
<tr><td><strong>Example</strong></td><td>Unencoded:<br><code>Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36</code><br>Encoded:<br><code>Mozilla%2F5.0%20(X11%3B%20Linux%20x86_64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F51.0.2704.103%20Safari%2F537.36</code></td></tr>
</table>

<table>
<tr><td><strong>Name</strong></td><td><code>[SERVERSIDE]</code></td></tr>
<tr><td><strong>Type</strong></td><td>integer</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>Value indicating if a URL is requested from a client device or a server. This value may be set differently on the request versus tracking URLs, as the request may be made from a server (value of 1 or 2) while tracking URIs may be fired from the client (value of 0)<br><br>0 - Client fires request or tracking call without server intermediary.<br>1 - Server fires request or tracking call on behalf of a client. The client told the server to act on its behalf.<br>2 - Server fires request or tracking call on behalf of another server, unknown party, or based on its own decision, without an explicit signal from the client.<br><br>0 is the default value if macro is missing.</td></tr>
<tr><td><strong>Example</strong></td><td>1</td></tr>
</table>

<table>
<tr><td><strong>Name</strong></td><td><code>[DEVICEIP]</code></td></tr>
<tr><td><strong>Type</strong></td><td>string</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>IP address of the device that is rendering the ad to the end user.<br><br>Only relevant when another device (server) is making the request on behalf of that client.</td></tr>
<tr><td><strong>Example</strong></td><td>IPv4: <code>8.8.8.8</code><br>IPv6 unencoded: <code>2001:0db8:85a3:0000:0000:8a2e:0370:7334</code><br>IPv6 encoded: <code>200153A0db853A85a353A000053A000053A8a2e53A037053A7334</code></td></tr>
</table>

<table>
<tr><td><strong>Name</strong></td><td><code>[LATLONG]</code></td></tr>
<tr><td><strong>Type</strong></td><td>number,number</td></tr>
<tr><td><strong>Introduced In</strong></td><td>VAST 4.1</td></tr>
<tr><td><strong>Support Status</strong></td><td>Optional</td></tr>
<tr><td><strong>Contexts</strong></td><td>All tracking pixels<br>VAST request URIs</td></tr>
<tr><td><strong>Description</strong></td><td>Mobile detected geolocation info of the end user, numeric latitude and longitude separated by a ","</td></tr>
<tr><td><strong>Example</strong></td><td><code>51.004703,3.754806</code></td></tr>
</table>