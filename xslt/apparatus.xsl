<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:exsl="http://exslt.org/common"
                xmlns:x="http://www.tei-c.org/ns/1.0"
                xmlns:tst="https://github.com/tst-project"
                exclude-result-prefixes="x tst">

<xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>

<xsl:template name="splitwit">
    <xsl:param name="mss" select="@wit"/>
        <xsl:if test="string-length($mss)">
            <!--xsl:if test="not($mss=@wit)"><xsl:text>,</xsl:text></xsl:if-->
            <xsl:element name="span">
                 <xsl:attribute name="class">embedded msid</xsl:attribute>
                 <xsl:attribute name="lang">en</xsl:attribute>
                 <xsl:variable name="msstring" select="substring-before(
                                            concat($mss,' '),
                                          ' ')"/>
                 <xsl:variable name="cleanstr" select="substring-after($msstring,'#')"/>
                 <xsl:variable name="siglum" select="/x:TEI/x:teiHeader/x:fileDesc/x:sourceDesc/x:listWit/x:witness[@xml:id=$cleanstr]/x:abbr/node()"/>
                 <xsl:choose>
                    <xsl:when test="$siglum">
                        <xsl:apply-templates select="$siglum"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$cleanstr"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:element>
            <xsl:call-template name="splitwit">
                <xsl:with-param name="mss" select=
                    "substring-after($mss, ' ')"/>
            </xsl:call-template>
        </xsl:if>
</xsl:template>

<xsl:template match="x:listWit"/>

<xsl:template match="x:app">
    <span class="app-inline">
        <xsl:attribute name="data-anno"/>
        <span class="lem-inline">
            <xsl:call-template name="lang"/>
            <xsl:apply-templates select="x:lem/node()"/>
        </span>
        <span class="anno-inline">
            <xsl:if test="x:rdg">
                <xsl:call-template name="lemma"/>
                <xsl:apply-templates select="x:rdg"/>
            </xsl:if>
            <xsl:apply-templates select="x:note"/>
        </span>
    </span>
</xsl:template>

<xsl:template name="lemma">
    <span>
        <xsl:attribute name="class">lem</xsl:attribute>
        <xsl:apply-templates select="x:lem/node()"/>
    </span>
    <xsl:if test="x:lem/@wit">
        <span>
            <xsl:attribute name="class">lem-wit</xsl:attribute>
            <xsl:call-template name="splitwit">
                <xsl:with-param name="mss" select="x:lem/@wit"/>
            </xsl:call-template>
        </span>
    </xsl:if>
    <xsl:text> </xsl:text>
</xsl:template>

<xsl:template match="x:rdg">
    <xsl:text> </xsl:text>
    <span>
        <xsl:attribute name="class">rdg</xsl:attribute>
        <span>
            <xsl:attribute name="class">rdg-text</xsl:attribute>
            <xsl:apply-templates select="./node()"/>
        </span>
        <xsl:text> </xsl:text>
        <span>
            <xsl:attribute name="class">rdg-wit</xsl:attribute>
            <xsl:call-template name="splitwit"/>
        </span>
    </span>
</xsl:template>

<xsl:template match="x:abbr[@corresp]">
    <xsl:variable name="cleanstr" select="substring-after(@corresp,'#')"/>
    <xsl:apply-templates select="/x:TEI/x:teiHeader/x:fileDesc/x:sourceDesc/x:listWit/x:witness[@xml:id=$cleanstr]/x:abbr/node()"/>
</xsl:template>

</xsl:stylesheet>
